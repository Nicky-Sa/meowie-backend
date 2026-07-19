import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1784471144542 implements MigrationInterface {
    name = 'Auto1784471144542'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "taste"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "keywords"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "flexibility"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "movieIds" integer array NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "seriesIds" integer array NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "seriesSkipped" boolean NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "genreIds" integer array NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "era" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "reality" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "tasteAuthority" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "commitment" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "avoid" text array NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "exploreLevel" integer NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "exploreLevel"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "avoid"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "commitment"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "tasteAuthority"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "reality"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "era"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "genreIds"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "seriesSkipped"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "seriesIds"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "movieIds"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "flexibility" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "keywords" text array NOT NULL
        `);
    }

}
