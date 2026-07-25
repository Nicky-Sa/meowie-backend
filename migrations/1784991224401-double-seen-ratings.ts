import { MigrationInterface, QueryRunner } from "typeorm";

export class DoubleSeenRatings1784991224401 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ratings moved from a 1-5 scale to 1-10. Anything above 5 was already
        // picked on the new scale, so only the old scores are doubled.
        await queryRunner.query(`
            UPDATE "library_items"
            SET "rating" = "rating" * 2
            WHERE "rating" BETWEEN 1 AND 5
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Odd scores have no exact 1-5 match, so they round up rather than
        // being thrown away.
        await queryRunner.query(`
            UPDATE "library_items"
            SET "rating" = CEIL("rating" / 2.0)
            WHERE "rating" IS NOT NULL
        `);
    }

}
