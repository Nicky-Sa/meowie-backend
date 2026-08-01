import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1785596677918 implements MigrationInterface {
    name = 'Auto1785596677918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "reality"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "commitment"
        `);
    }

    // What users answered can't be recovered, so going back fills 'both'.
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "commitment" character varying NOT NULL DEFAULT 'both'
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "reality" character varying NOT NULL DEFAULT 'both'
        `);

        await queryRunner.query(`
            ALTER TABLE "taste" ALTER COLUMN "commitment" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" ALTER COLUMN "reality" DROP DEFAULT
        `);
    }

}
