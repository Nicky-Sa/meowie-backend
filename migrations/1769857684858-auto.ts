import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1769857684858 implements MigrationInterface {
  name = 'Auto1769857684858';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "saved" DROP CONSTRAINT "UQ_d081d7d25b4d7ba25506aa432e3"
        `);
    await queryRunner.query(`
            ALTER TABLE "saved"
            ADD "mediaType" character varying NOT NULL DEFAULT 'movies'
        `);
    await queryRunner.query(`
            ALTER TABLE "saved"
            ADD CONSTRAINT "UQ_a87cf6ede5d55c59d14de1c6590" UNIQUE ("userId", "tmdbId", "mediaType")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "saved" DROP CONSTRAINT "UQ_a87cf6ede5d55c59d14de1c6590"
        `);
    await queryRunner.query(`
            ALTER TABLE "saved" DROP COLUMN "mediaType"
        `);
    await queryRunner.query(`
            ALTER TABLE "saved"
            ADD CONSTRAINT "UQ_d081d7d25b4d7ba25506aa432e3" UNIQUE ("userId", "tmdbId")
        `);
  }
}
