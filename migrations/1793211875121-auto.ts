import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1793211875121 implements MigrationInterface {
  name = 'Auto1793211875121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "appleUserId" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_e1e25102182182051ab13e51c80" UNIQUE ("appleUserId")
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "googleUserId" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_0f8ef7257051cfd070ab84301bc" UNIQUE ("googleUserId")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_0f8ef7257051cfd070ab84301bc"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "googleUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_e1e25102182182051ab13e51c80"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "appleUserId"
        `);
  }
}
