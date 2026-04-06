import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1775490000000 implements MigrationInterface {
  name = 'Auto1775490000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fill existing NULLs before constraining
    await queryRunner.query(
      `UPDATE "meowie"."collections" SET "logo_url" = '' WHERE "logo_url" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "meowie"."collections" SET "backdrop_url" = '' WHERE "backdrop_url" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "meowie"."collections" SET "color_hex" = '#A855F7' WHERE "color_hex" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "logo_url" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "logo_url" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "backdrop_url" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "backdrop_url" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "color_hex" SET DEFAULT '#A855F7'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "color_hex" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "logo_url" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "logo_url" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "backdrop_url" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "backdrop_url" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "color_hex" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meowie"."collections" ALTER COLUMN "color_hex" DROP DEFAULT`,
    );
  }
}
