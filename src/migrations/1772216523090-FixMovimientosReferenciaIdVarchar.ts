import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMovimientosReferenciaIdVarchar1772216523090 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Asegurar que referencia_id sea varchar para permitir cualquier tipo de identificador manual o de sistema
        await queryRunner.query(`ALTER TABLE "api_pacifico"."movimientos_caja" ALTER COLUMN "referencia_id" TYPE character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Volver a uuid (requiere conversión explícita)
        await queryRunner.query(`ALTER TABLE "api_pacifico"."movimientos_caja" ALTER COLUMN "referencia_id" TYPE uuid USING "referencia_id"::uuid`);
    }

}
