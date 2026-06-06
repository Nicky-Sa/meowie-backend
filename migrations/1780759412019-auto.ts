import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1780759412019 implements MigrationInterface {
    name = 'Auto1780759412019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "churn_log" RENAME TO "churn_logs"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "churn_logs" RENAME TO "churn_log"
        `);
    }

}
