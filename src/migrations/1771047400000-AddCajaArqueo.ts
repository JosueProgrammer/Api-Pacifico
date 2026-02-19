import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCajaArqueo1771047400000 implements MigrationInterface {
    name = 'AddCajaArqueo1771047400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla de cajas
        await queryRunner.query(`
            CREATE TABLE "cajas" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "usuario_id" uuid NOT NULL,
                "fecha_apertura" TIMESTAMP NOT NULL DEFAULT now(),
                "fecha_cierre" TIMESTAMP,
                "monto_inicial" numeric(10,2) NOT NULL DEFAULT '0',
                "monto_final" numeric(10,2),
                "monto_esperado" numeric(10,2),
                "diferencia" numeric(10,2),
                "estado" character varying(20) NOT NULL DEFAULT 'abierta',
                "observaciones" text,
                CONSTRAINT "PK_cajas_id" PRIMARY KEY ("id")
            )
        `);

        // Crear tabla de movimientos de caja
        await queryRunner.query(`
            CREATE TABLE "movimientos_caja" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "caja_id" uuid NOT NULL,
                "tipo" character varying(20) NOT NULL,
                "monto" numeric(10,2) NOT NULL,
                "concepto" character varying(255),
                "referencia_id" uuid,
                "usuario_id" uuid NOT NULL,
                "fecha" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_movimientos_caja_id" PRIMARY KEY ("id")
            )
        `);

        // Agregar foreign keys
        await queryRunner.query(`
            ALTER TABLE "cajas" 
            ADD CONSTRAINT "FK_cajas_usuario" 
            FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "movimientos_caja" 
            ADD CONSTRAINT "FK_movimientos_caja_caja" 
            FOREIGN KEY ("caja_id") REFERENCES "cajas"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "movimientos_caja" 
            ADD CONSTRAINT "FK_movimientos_caja_usuario" 
            FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Crear índices para mejor rendimiento
        await queryRunner.query(`CREATE INDEX "IDX_cajas_usuario_estado" ON "cajas" ("usuario_id", "estado")`);
        await queryRunner.query(`CREATE INDEX "IDX_movimientos_caja_caja" ON "movimientos_caja" ("caja_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_movimientos_caja_fecha" ON "movimientos_caja" ("fecha")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX "IDX_movimientos_caja_fecha"`);
        await queryRunner.query(`DROP INDEX "IDX_movimientos_caja_caja"`);
        await queryRunner.query(`DROP INDEX "IDX_cajas_usuario_estado"`);

        // Eliminar foreign keys
        await queryRunner.query(`ALTER TABLE "movimientos_caja" DROP CONSTRAINT "FK_movimientos_caja_usuario"`);
        await queryRunner.query(`ALTER TABLE "movimientos_caja" DROP CONSTRAINT "FK_movimientos_caja_caja"`);
        await queryRunner.query(`ALTER TABLE "cajas" DROP CONSTRAINT "FK_cajas_usuario"`);

        // Eliminar tablas
        await queryRunner.query(`DROP TABLE "movimientos_caja"`);
        await queryRunner.query(`DROP TABLE "cajas"`);
    }
}
