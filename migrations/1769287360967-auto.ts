import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1769287360967 implements MigrationInterface {
    name = 'Auto1769287360967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "saved" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "saved"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "churn_log" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "churn_log"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "otp" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "otp"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "otp" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "otp"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "otp" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "otp"
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "otp" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "otp"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "churn_log" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "churn_log"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "saved" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "saved"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    }

}
