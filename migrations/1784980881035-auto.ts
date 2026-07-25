import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1784980881035 implements MigrationInterface {
    name = 'Auto1784980881035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "taste"
            RENAME COLUMN "tasteAuthority" TO "authority"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "taste"
            RENAME COLUMN "authority" TO "tasteAuthority"
        `);
    }

}
