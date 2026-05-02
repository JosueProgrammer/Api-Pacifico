import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeReferenciaIdToString1771735241269 implements MigrationInterface {
    name = 'ChangeReferenciaIdToString1771735241269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "api_pacifico"."IDX_cajas_usuario_estado"`);
        await queryRunner.query(`DROP INDEX "api_pacifico"."IDX_movimientos_caja_caja"`);
        await queryRunner.query(`DROP INDEX "api_pacifico"."IDX_movimientos_caja_fecha"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."movimientos_caja" DROP COLUMN "referencia_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."movimientos_caja" ADD "referencia_id" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_pacifico"."movimientos_caja" DROP COLUMN "referencia_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."movimientos_caja" ADD "referencia_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_movimientos_caja_fecha" ON "api_pacifico"."movimientos_caja" ("fecha") `);
        await queryRunner.query(`CREATE INDEX "IDX_movimientos_caja_caja" ON "api_pacifico"."movimientos_caja" ("caja_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_cajas_usuario_estado" ON "api_pacifico"."cajas" ("estado", "usuario_id") `);
    }

}
