import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDevoluciones1771048947103 implements MigrationInterface {
    name = 'AddDevoluciones1771048947103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cajas" DROP CONSTRAINT "FK_cajas_usuario"`);
        await queryRunner.query(`ALTER TABLE "movimientos_caja" DROP CONSTRAINT "FK_movimientos_caja_usuario"`);
        await queryRunner.query(`ALTER TABLE "movimientos_caja" DROP CONSTRAINT "FK_movimientos_caja_caja"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cajas_usuario_estado"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_movimientos_caja_caja"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_movimientos_caja_fecha"`);
        await queryRunner.query(`CREATE TABLE "detalle_devoluciones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "devolucion_id" uuid NOT NULL, "detalle_venta_id" uuid NOT NULL, "producto_id" uuid NOT NULL, "cantidad" numeric(10,3) NOT NULL, "precio_unitario" numeric(10,2) NOT NULL, "subtotal" numeric(10,2) NOT NULL, "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ed61aa181bb4c01fdf29de589e9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "devoluciones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "numero_devolucion" character varying NOT NULL, "venta_id" uuid NOT NULL, "usuario_id" uuid NOT NULL, "fecha" TIMESTAMP NOT NULL DEFAULT now(), "motivo" text NOT NULL, "tipo" character varying(20) NOT NULL, "monto_devuelto" numeric(10,2) NOT NULL, "estado" character varying(20) NOT NULL DEFAULT 'procesada', "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fcadf2617998e6d19b7e87386fa" UNIQUE ("numero_devolucion"), CONSTRAINT "PK_feb81d67019ea7b8f09eb54ec33" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cajas" ADD CONSTRAINT "FK_6f28154a3dda0d70c72867f7c97" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimientos_caja" ADD CONSTRAINT "FK_fa3667fcb88a50ddfe4f39aa800" FOREIGN KEY ("caja_id") REFERENCES "cajas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimientos_caja" ADD CONSTRAINT "FK_54e0399df650a63fc8896df47f8" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "detalle_devoluciones" ADD CONSTRAINT "FK_aff5379d73ed11ca31e0800c9f3" FOREIGN KEY ("devolucion_id") REFERENCES "devoluciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "detalle_devoluciones" ADD CONSTRAINT "FK_283a59e5306a36708f7e422bbea" FOREIGN KEY ("detalle_venta_id") REFERENCES "detalle_ventas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "detalle_devoluciones" ADD CONSTRAINT "FK_e6cc98c7051e3a6872cfbe5d85e" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "devoluciones" ADD CONSTRAINT "FK_d51cc3aa053995cda9816ba1c39" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "devoluciones" ADD CONSTRAINT "FK_baccf9eefac37fd24b921b35d72" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "devoluciones" DROP CONSTRAINT "FK_baccf9eefac37fd24b921b35d72"`);
        await queryRunner.query(`ALTER TABLE "devoluciones" DROP CONSTRAINT "FK_d51cc3aa053995cda9816ba1c39"`);
        await queryRunner.query(`ALTER TABLE "detalle_devoluciones" DROP CONSTRAINT "FK_e6cc98c7051e3a6872cfbe5d85e"`);
        await queryRunner.query(`ALTER TABLE "detalle_devoluciones" DROP CONSTRAINT "FK_283a59e5306a36708f7e422bbea"`);
        await queryRunner.query(`ALTER TABLE "detalle_devoluciones" DROP CONSTRAINT "FK_aff5379d73ed11ca31e0800c9f3"`);
        await queryRunner.query(`ALTER TABLE "movimientos_caja" DROP CONSTRAINT "FK_54e0399df650a63fc8896df47f8"`);
        await queryRunner.query(`ALTER TABLE "movimientos_caja" DROP CONSTRAINT "FK_fa3667fcb88a50ddfe4f39aa800"`);
        await queryRunner.query(`ALTER TABLE "cajas" DROP CONSTRAINT "FK_6f28154a3dda0d70c72867f7c97"`);
        await queryRunner.query(`DROP TABLE "devoluciones"`);
        await queryRunner.query(`DROP TABLE "detalle_devoluciones"`);
        await queryRunner.query(`CREATE INDEX "IDX_movimientos_caja_fecha" ON "movimientos_caja" ("fecha") `);
        await queryRunner.query(`CREATE INDEX "IDX_movimientos_caja_caja" ON "movimientos_caja" ("caja_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_cajas_usuario_estado" ON "cajas" ("estado", "usuario_id") `);
        await queryRunner.query(`ALTER TABLE "movimientos_caja" ADD CONSTRAINT "FK_movimientos_caja_caja" FOREIGN KEY ("caja_id") REFERENCES "cajas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimientos_caja" ADD CONSTRAINT "FK_movimientos_caja_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cajas" ADD CONSTRAINT "FK_cajas_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
