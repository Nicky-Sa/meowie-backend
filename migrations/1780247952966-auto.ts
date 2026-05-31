import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1780247952966 implements MigrationInterface {
    name = 'Auto1780247952966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "bookmarks" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "saved" CASCADE`);
        await queryRunner.query(`
            ALTER TABLE "collection_items" DROP CONSTRAINT "FK_0f16b27c93df83264343ae57b5f"
        `);
        await queryRunner.query(`
            ALTER TABLE "collections" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_0f16b27c93df83264343ae57b5"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_88cea2dc9c31951d06437879b4"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_21bf61f8ce7e69b7bcaee62567" ON "collection_items" ("collection_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0f812cc4eb3b50276468bb4a1a" ON "collections" ("parent_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items"
            ADD CONSTRAINT "FK_21bf61f8ce7e69b7bcaee625676" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ADD CONSTRAINT "FK_0f812cc4eb3b50276468bb4a1a7" FOREIGN KEY ("parent_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "collections" DROP CONSTRAINT "FK_0f812cc4eb3b50276468bb4a1a7"
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items" DROP CONSTRAINT "FK_21bf61f8ce7e69b7bcaee625676"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_0f812cc4eb3b50276468bb4a1a"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_21bf61f8ce7e69b7bcaee62567"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_88cea2dc9c31951d06437879b4" ON "collections" ("parent_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0f16b27c93df83264343ae57b5" ON "collection_items" ("collection_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items"
            ADD CONSTRAINT "FK_0f16b27c93df83264343ae57b5f" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
