import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1784977653405 implements MigrationInterface {
    name = 'Auto1784977653405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_a368a903802399ae9b33d7b1a9"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_a368a903802399ae9b33d7b1a9" ON "taste" ("userId")
        `);
    }

}
