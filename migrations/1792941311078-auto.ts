import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1792941311078 implements MigrationInterface {
    name = 'Auto1792941311078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "feed_processed_titles"
            ADD "timesScored" integer NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "feed_processed_titles"
            ADD "lastScore" real
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "feed_processed_titles" DROP COLUMN "lastScore"
        `);
        await queryRunner.query(`
            ALTER TABLE "feed_processed_titles" DROP COLUMN "timesScored"
        `);
    }

}
