import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1775509694105 implements MigrationInterface {
  name = 'Auto1775509694105';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "collection_items"
        ADD CONSTRAINT "UQ_ac4a584e757276e75d970a6474c" UNIQUE ("position")
    `);
    await queryRunner.query(`
      ALTER TABLE "collection_items"
        ALTER COLUMN "position" DROP DEFAULT
    `);
    await queryRunner.query(`
      ALTER TABLE "collections"
        ALTER COLUMN "logo_url"
          SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "collections"
        ALTER COLUMN "backdrop_url"
          SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "collections"
        ALTER COLUMN "color_hex"
          SET NOT NULL
    `);

    // --- FIXED: media_type conversion ---
    await queryRunner.query(`
            CREATE TYPE "meowie"."collections_media_type_enum" AS ENUM('movie', 'series', 'mixed')
        `);
    await queryRunner.query(`
            ALTER TABLE "collections" 
            ALTER COLUMN "media_type" TYPE "meowie"."collections_media_type_enum" 
            USING "media_type"::"meowie"."collections_media_type_enum"
        `);

    // --- FIXED: source_type conversion ---
    await queryRunner.query(`
            CREATE TYPE "meowie"."collections_source_type_enum" AS ENUM('tmdb_endpoint', 'manual', 'group')
        `);
    await queryRunner.query(`
      ALTER TABLE "collections"
        ALTER COLUMN "source_type" TYPE "meowie"."collections_source_type_enum"
          USING "source_type"::"meowie"."collections_source_type_enum"
    `);

    await queryRunner.query(`
      ALTER TABLE "collections"
        ADD CONSTRAINT "UQ_21eef070fed7904d3a9853647f9" UNIQUE ("position")
    `);
    await queryRunner.query(`
      ALTER TABLE "collections"
        ALTER COLUMN "position" DROP DEFAULT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "collections"
        ALTER COLUMN "position"
          SET DEFAULT '0'
    `);
    await queryRunner.query(`
      ALTER TABLE "collections" DROP CONSTRAINT "UQ_21eef070fed7904d3a9853647f9"
    `);

    // --- FIXED: revert source_type ---
    await queryRunner.query(`
      ALTER TABLE "collections"
        ALTER COLUMN "source_type" TYPE character varying(20)
          USING "source_type"::character varying
    `);
    await queryRunner.query(`
            DROP TYPE "meowie"."collections_source_type_enum"
        `);

    // --- FIXED: revert media_type ---
    await queryRunner.query(`
      ALTER TABLE "collections"
        ALTER COLUMN "media_type" TYPE character varying(10)
          USING "media_type"::character varying
    `);
    await queryRunner.query(`
            DROP TYPE "meowie"."collections_media_type_enum"
        `);

    await queryRunner.query(`
      ALTER TABLE "collections"
        ALTER COLUMN "color_hex" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "collections"
        ALTER COLUMN "backdrop_url" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "collections"
        ALTER COLUMN "logo_url" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "collection_items"
        ALTER COLUMN "position"
          SET DEFAULT '0'
    `);
    await queryRunner.query(`
      ALTER TABLE "collection_items" DROP CONSTRAINT "UQ_ac4a584e757276e75d970a6474c"
    `);
  }
}
