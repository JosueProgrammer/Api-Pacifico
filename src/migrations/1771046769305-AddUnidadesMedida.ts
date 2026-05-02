import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUnidadesMedida1771046769305 implements MigrationInterface {
    name = 'AddUnidadesMedida1771046769305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "api_pacifico"."unidades_medida" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "abreviatura" character varying(10) NOT NULL, "tipo" character varying(20) NOT NULL DEFAULT 'unidad', "activo" boolean NOT NULL DEFAULT true, "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b299f0e6758c0c02ae3e729232a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" ADD "unidad_medida_id" uuid`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."descuentos" ADD "limite_uso" integer`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."descuentos" ADD "veces_usado" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."ventas" ADD "descuento_id" uuid`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_compras" DROP COLUMN "cantidad"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_compras" ADD "cantidad" numeric(10,3) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."inventario" DROP COLUMN "cantidad"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."inventario" ADD "cantidad" numeric(10,3) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" ADD "stock" numeric(10,3) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" DROP COLUMN "stock_minimo"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" ADD "stock_minimo" numeric(10,3) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_ventas" DROP COLUMN "cantidad"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_ventas" ADD "cantidad" numeric(10,3) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" ADD CONSTRAINT "FK_d9d573eddc1e6de0f2ded4fd888" FOREIGN KEY ("unidad_medida_id") REFERENCES "api_pacifico"."unidades_medida"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."ventas" ADD CONSTRAINT "FK_b0be5de6897dd548f499fc6e3a8" FOREIGN KEY ("descuento_id") REFERENCES "api_pacifico"."descuentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_pacifico"."ventas" DROP CONSTRAINT "FK_b0be5de6897dd548f499fc6e3a8"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" DROP CONSTRAINT "FK_d9d573eddc1e6de0f2ded4fd888"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_ventas" DROP COLUMN "cantidad"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_ventas" ADD "cantidad" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" DROP COLUMN "stock_minimo"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" ADD "stock_minimo" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" ADD "stock" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."inventario" DROP COLUMN "cantidad"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."inventario" ADD "cantidad" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_compras" DROP COLUMN "cantidad"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_compras" ADD "cantidad" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."ventas" DROP COLUMN "descuento_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."descuentos" DROP COLUMN "veces_usado"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."descuentos" DROP COLUMN "limite_uso"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" DROP COLUMN "unidad_medida_id"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."unidades_medida"`);
    }

}
