import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1766944756559 implements MigrationInterface {
    name = 'Auto1766944756559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "bookmarks" (
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                "tmdbId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_8d9572641ce66a27066f7d22e72" UNIQUE ("userId", "tmdbId"),
                CONSTRAINT "PK_7f976ef6cecd37a53bd11685f32" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c6065536f2f6de3a0163e19a58" ON "bookmarks" ("userId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e2a626f6e44210ca46ab320af7" ON "bookmarks" ("tmdbId")
        `);
        await queryRunner.query(`
            ALTER TABLE "bookmarks"
            ADD CONSTRAINT "FK_c6065536f2f6de3a0163e19a584" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "bookmarks" DROP CONSTRAINT "FK_c6065536f2f6de3a0163e19a584"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_e2a626f6e44210ca46ab320af7"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_c6065536f2f6de3a0163e19a58"
        `);
        await queryRunner.query(`
            DROP TABLE "bookmarks"
        `);
    }

}
