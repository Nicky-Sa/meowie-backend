import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1763912236585 implements MigrationInterface {
    name = 'Auto1763912236585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "churn_log" (
                "id" SERIAL NOT NULL,
                "reason" character varying NOT NULL,
                "userTenureInDays" integer,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_487b8b239bf02fd252f23dc1770" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "churn_log"
        `);
    }

}
