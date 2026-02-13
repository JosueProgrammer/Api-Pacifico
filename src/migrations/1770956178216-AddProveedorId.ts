import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProveedorId1770956178216 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "api_pacifico"."productos" ADD "proveedor_id" uuid`
        );

        await queryRunner.query(
            `ALTER TABLE "api_pacifico"."productos" ADD CONSTRAINT "FK_productos_proveedor_id" FOREIGN KEY ("proveedor_id") REFERENCES "api_pacifico"."proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "api_pacifico"."productos" DROP CONSTRAINT "FK_productos_proveedor_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "api_pacifico"."productos" DROP COLUMN "proveedor_id"`
        );
    }

}
