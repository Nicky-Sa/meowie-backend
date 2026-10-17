import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1792264816371 implements MigrationInterface {
    name = 'Auto1792264816371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "explore_tabs" (
                "id" SERIAL NOT NULL,
                "slug" character varying(100) NOT NULL,
                "title" character varying(255) NOT NULL,
                "position" integer NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "sources" jsonb NOT NULL,
                CONSTRAINT "UQ_19bbf21a1eb2d1334fb2578ab70" UNIQUE ("slug"),
                CONSTRAINT "PK_4316895a9a95bf739452ffe8d55" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "explore_tabs"
        `);
    }

}
