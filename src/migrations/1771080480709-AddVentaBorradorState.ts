import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVentaBorradorState1771080480709 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `COMMENT ON COLUMN "ventas"."estado" IS 'Enum: pendiente, completada, cancelada, borrador'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `COMMENT ON COLUMN "ventas"."estado" IS 'Enum: pendiente, completada, cancelada'`,
        );
    }

}
