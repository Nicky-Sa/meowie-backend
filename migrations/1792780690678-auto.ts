import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1792780690678 implements MigrationInterface {
    name = 'Auto1792780690678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "feed_processed_titles"
            ADD "origins" jsonb NOT NULL DEFAULT '[]'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "feed_processed_titles" DROP COLUMN "origins"
        `);
    }

}
