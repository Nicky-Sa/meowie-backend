import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1792233448087 implements MigrationInterface {
  name = 'Auto1792233448087';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "feeds" (
                "id" SERIAL NOT NULL,
                "userId" integer,
                "deviceCode" uuid,
                "mediaType" character varying NOT NULL,
                "inputId" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sources" jsonb NOT NULL,
                CONSTRAINT "UQ_33cd2d4f2e2fd8d910d939a3966" UNIQUE ("deviceCode", "mediaType"),
                CONSTRAINT "UQ_6127ca2d184bd0b139735208c7a" UNIQUE ("userId", "mediaType"),
                CONSTRAINT "CHK_11f2db9842e13f72585d25406e" CHECK (
                    (
                        "userId" IS NOT NULL
                        AND "deviceCode" IS NULL
                    )
                    OR (
                        "userId" IS NULL
                        AND "deviceCode" IS NOT NULL
                    )
                ),
                CONSTRAINT "PK_3dafbf766ecbb1eb2017732153f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "feed_processed_titles" (
                "feedId" integer NOT NULL,
                "tmdbId" integer NOT NULL,
                "isAccepted" boolean NOT NULL DEFAULT false,
                "isDelivered" boolean NOT NULL DEFAULT false,
                CONSTRAINT "CHK_4fb7aee6ab8c036c52dccdb5f5" CHECK (
                    "isAccepted" = true
                    OR "isDelivered" = false
                ),
                CONSTRAINT "PK_e654fc15f7762f165ddb986e073" PRIMARY KEY ("feedId", "tmdbId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_4092de5cb07e7a929fb9612321" ON "feed_processed_titles" ("feedId", "isDelivered")
            WHERE "isAccepted" = true
        `);
    await queryRunner.query(`
            ALTER TABLE "feeds"
            ADD CONSTRAINT "FK_1dc57d1b6372d3089fce2848191" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "feed_processed_titles"
            ADD CONSTRAINT "FK_5a0230e6d5b4a7b53eb46a48801" FOREIGN KEY ("feedId") REFERENCES "feeds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "feed_processed_titles" DROP CONSTRAINT "FK_5a0230e6d5b4a7b53eb46a48801"
        `);
    await queryRunner.query(`
            ALTER TABLE "feeds" DROP CONSTRAINT "FK_1dc57d1b6372d3089fce2848191"
        `);
    await queryRunner.query(`
            DROP INDEX "meowie"."IDX_4092de5cb07e7a929fb9612321"
        `);
    await queryRunner.query(`
            DROP TABLE "feed_processed_titles"
        `);
    await queryRunner.query(`
            DROP TABLE "feeds"
        `);
  }
}
