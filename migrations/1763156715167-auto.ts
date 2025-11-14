import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1763156715167 implements MigrationInterface {
    name = 'Auto1763156715167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "hashedRefreshToken" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "hashedRefreshToken"
        `);
    }

}
