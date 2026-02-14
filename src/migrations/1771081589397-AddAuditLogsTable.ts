import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditLogsTable1771081589397 implements MigrationInterface {
    name = 'AddAuditLogsTable1771081589397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity_name" character varying NOT NULL, "entity_id" character varying NOT NULL, "action" character varying NOT NULL, "changes" jsonb, "user_id" uuid, "ip_address" character varying, "user_agent" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`COMMENT ON COLUMN "ventas"."estado" IS NULL`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`);
        await queryRunner.query(`COMMENT ON COLUMN "ventas"."estado" IS 'Enum: pendiente, completada, cancelada, borrador'`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
    }

}
