import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1781454751222 implements MigrationInterface {
    name = 'Auto1781454751222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "taste" (
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                "keywords" text array NOT NULL,
                "flexibility" smallint NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_a368a903802399ae9b33d7b1a9c" UNIQUE ("userId"),
                CONSTRAINT "PK_19ee551a90d8693a283fcf41ea7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a368a903802399ae9b33d7b1a9" ON "taste" ("userId")
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "hasFilledInTaste" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            CREATE SEQUENCE IF NOT EXISTS "churn_logs_id_seq" OWNED BY "churn_logs"."id"
        `);
        await queryRunner.query(`
            ALTER TABLE "churn_logs"
            ALTER COLUMN "id"
            SET DEFAULT nextval('"churn_logs_id_seq"')
        `);
        await queryRunner.query(`
            ALTER TABLE "churn_logs"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "taste"
            ADD CONSTRAINT "FK_a368a903802399ae9b33d7b1a9c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "taste" DROP CONSTRAINT "FK_a368a903802399ae9b33d7b1a9c"
        `);
        await queryRunner.query(`
            ALTER TABLE "churn_logs"
            ALTER COLUMN "id"
            SET DEFAULT nextval('churn_log_id_seq')
        `);
        await queryRunner.query(`
            ALTER TABLE "churn_logs"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            DROP SEQUENCE "churn_logs_id_seq"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "hasFilledInTaste"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_a368a903802399ae9b33d7b1a9"
        `);
        await queryRunner.query(`
            DROP TABLE "taste"
        `);
    }

}
