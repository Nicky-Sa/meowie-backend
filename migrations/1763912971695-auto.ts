import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1763912971695 implements MigrationInterface {
    name = 'Auto1763912971695'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "createdAt"
        `);
    }

}
