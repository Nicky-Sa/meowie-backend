import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1775602393972 implements MigrationInterface {
    name = 'Auto1775602393972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "collection_items" DROP CONSTRAINT "UQ_eb3c651ff17d1254090114dbe9e"
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items"
            ADD CONSTRAINT "UQ_8486b9f06aa53a33f37e78e2deb" UNIQUE ("collection_id", "tmdb_id", "position")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "collection_items" DROP CONSTRAINT "UQ_8486b9f06aa53a33f37e78e2deb"
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items"
            ADD CONSTRAINT "UQ_eb3c651ff17d1254090114dbe9e" UNIQUE ("collection_id", "tmdb_id")
        `);
    }

}
