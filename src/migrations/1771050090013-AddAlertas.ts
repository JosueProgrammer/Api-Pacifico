import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAlertas1771050090013 implements MigrationInterface {
    name = 'AddAlertas1771050090013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alertas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tipo" character varying(50) NOT NULL, "titulo" character varying(255) NOT NULL, "mensaje" text NOT NULL, "entidad_id" uuid, "entidad_tipo" character varying(50), "leida" boolean NOT NULL DEFAULT false, "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b474c4021f8d6e4e13383ef1106" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "alertas"`);
    }

}
