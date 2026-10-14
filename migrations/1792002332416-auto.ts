import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1792002332416 implements MigrationInterface {
  name = 'Auto1792002332416';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "era"
        `);
    await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "authority"
        `);
    await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "exploreLevel"
        `);
  }

  /** Removed answers cannot be recovered, so rollback uses no preference and balanced. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "exploreLevel" integer NOT NULL DEFAULT 2
        `);
    await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "authority" character varying NOT NULL DEFAULT 'both'
        `);
    await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "era" character varying NOT NULL DEFAULT 'both'
        `);
    await queryRunner.query(`
            ALTER TABLE "taste" ALTER COLUMN "exploreLevel" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "taste" ALTER COLUMN "authority" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "taste" ALTER COLUMN "era" DROP DEFAULT
        `);
  }
}
