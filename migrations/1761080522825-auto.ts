import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1761080522825 implements MigrationInterface {
    name = 'Auto1761080522825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "hashedPassword"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "salt"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "salt" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "hashedPassword" character varying NOT NULL
        `);
    }

}
