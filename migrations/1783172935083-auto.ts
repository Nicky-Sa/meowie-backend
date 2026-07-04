import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1783172935083 implements MigrationInterface {
    name = 'Auto1783172935083'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "release_notes" (
                "id" SERIAL NOT NULL,
                "emoji" character varying(16) NOT NULL,
                "title" character varying(120) NOT NULL,
                "description" text NOT NULL,
                "version" character varying(32) NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_179a834cbb85caae10634bc7bf3" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_063fc5b4515e804cc1b4416c25" ON "release_notes" ("isActive")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_063fc5b4515e804cc1b4416c25"
        `);
        await queryRunner.query(`
            DROP TABLE "release_notes"
        `);
    }

}
