import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1781954919228 implements MigrationInterface {
    name = 'Auto1781954919228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE IF NOT EXISTS "churn_logs_id_seq" OWNED BY "churn_logs"."id"
        `);
        await queryRunner.query(`
            ALTER TABLE "churn_logs"
            ALTER COLUMN "id"
            SET DEFAULT nextval('"churn_logs_id_seq"')
        `);
        await queryRunner.query(`
            SELECT setval('"churn_logs_id_seq"', (SELECT COALESCE(MAX("id"), 1) FROM "churn_logs"), true)
        `);
        await queryRunner.query(`
            DROP SEQUENCE IF EXISTS "churn_log_id_seq"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "flexibility"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "flexibility" character varying NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "taste" DROP COLUMN "flexibility"
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD "flexibility" smallint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "churn_logs"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            DROP SEQUENCE "churn_logs_id_seq"
        `);
    }

}
