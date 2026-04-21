import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1776786794695 implements MigrationInterface {
    name = 'Auto1776786794695'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "library_items" DROP CONSTRAINT "UQ_5ddbd366eb81981845e3037265d"
        `);
        await queryRunner.query(`
            ALTER TABLE "library_items"
            ADD "rating" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "library_items"
            ADD CONSTRAINT "UQ_79a82f809b325fcfc499ad64357" UNIQUE ("userId", "tmdbId", "mediaType")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "library_items" DROP CONSTRAINT "UQ_79a82f809b325fcfc499ad64357"
        `);
        await queryRunner.query(`
            ALTER TABLE "library_items" DROP COLUMN "rating"
        `);
        await queryRunner.query(`
            ALTER TABLE "library_items"
            ADD CONSTRAINT "UQ_5ddbd366eb81981845e3037265d" UNIQUE ("userId", "tmdbId", "mediaType", "category")
        `);
    }

}
