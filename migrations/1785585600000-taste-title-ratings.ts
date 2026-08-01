import { MigrationInterface, QueryRunner } from 'typeorm';

// Old picks carry over as likes. The genre list can't be recovered, and
// nothing reads it any more.
export class TasteTitleRatings1785585600000 implements MigrationInterface {
  name = 'TasteTitleRatings1785585600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "taste"
      ADD "movieRatings" jsonb NOT NULL DEFAULT '{}'
    `);
    await queryRunner.query(`
      ALTER TABLE "taste"
      ADD "seriesRatings" jsonb NOT NULL DEFAULT '{}'
    `);

    await queryRunner.query(`
      UPDATE "taste"
      SET "movieRatings" = COALESCE((
        SELECT jsonb_object_agg("tmdbId"::text, 'like')
        FROM unnest("movieIds") AS "tmdbId"
      ), '{}'::jsonb),
      "seriesRatings" = COALESCE((
        SELECT jsonb_object_agg("tmdbId"::text, 'like')
        FROM unnest("seriesIds") AS "tmdbId"
      ), '{}'::jsonb)
    `);

    await queryRunner.query(`
      ALTER TABLE "taste"
      ALTER COLUMN "movieRatings" DROP DEFAULT
    `);
    await queryRunner.query(`
      ALTER TABLE "taste"
      ALTER COLUMN "seriesRatings" DROP DEFAULT
    `);

    await queryRunner.query(`ALTER TABLE "taste" DROP COLUMN "movieIds"`);
    await queryRunner.query(`ALTER TABLE "taste" DROP COLUMN "seriesIds"`);
    await queryRunner.query(`ALTER TABLE "taste" DROP COLUMN "seriesSkipped"`);
    await queryRunner.query(`ALTER TABLE "taste" DROP COLUMN "genreIds"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "taste"
      ADD "movieIds" integer array NOT NULL DEFAULT '{}'
    `);
    await queryRunner.query(`
      ALTER TABLE "taste"
      ADD "seriesIds" integer array NOT NULL DEFAULT '{}'
    `);
    await queryRunner.query(`
      ALTER TABLE "taste"
      ADD "seriesSkipped" boolean NOT NULL DEFAULT false
    `);
    // The genres a user confirmed are gone for good; going back leaves them empty.
    await queryRunner.query(`
      ALTER TABLE "taste"
      ADD "genreIds" integer array NOT NULL DEFAULT '{}'
    `);

    await queryRunner.query(`
      UPDATE "taste"
      SET "movieIds" = COALESCE((
        SELECT array_agg("tmdbId"::int)
        FROM jsonb_each_text("movieRatings") AS "rating"("tmdbId", "answer")
        WHERE "answer" = 'like'
      ), '{}'),
      "seriesIds" = COALESCE((
        SELECT array_agg("tmdbId"::int)
        FROM jsonb_each_text("seriesRatings") AS "rating"("tmdbId", "answer")
        WHERE "answer" = 'like'
      ), '{}'),
      "seriesSkipped" = "seriesRatings" = '{}'::jsonb
    `);

    await queryRunner.query(`ALTER TABLE "taste" DROP COLUMN "movieRatings"`);
    await queryRunner.query(`ALTER TABLE "taste" DROP COLUMN "seriesRatings"`);
  }
}
