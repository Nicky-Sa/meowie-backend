import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1785614859757 implements MigrationInterface {
    name = 'Auto1785614859757'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "hasFilledInTaste"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "hasFilledInTaste" boolean NOT NULL DEFAULT false
        `);
    }

}
