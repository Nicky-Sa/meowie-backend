import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1775601871690 implements MigrationInterface {
    name = 'Auto1775601871690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "collection_items" DROP CONSTRAINT "UQ_ac4a584e757276e75d970a6474c"
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ALTER COLUMN "logo_url" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ALTER COLUMN "backdrop_url" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ALTER COLUMN "color_hex" DROP DEFAULT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "collections"
            ALTER COLUMN "color_hex"
            SET DEFAULT '#A855F7'
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ALTER COLUMN "backdrop_url"
            SET DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ALTER COLUMN "logo_url"
            SET DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items"
            ADD CONSTRAINT "UQ_ac4a584e757276e75d970a6474c" UNIQUE ("position")
        `);
    }

}
