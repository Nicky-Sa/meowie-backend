import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1769258141014 implements MigrationInterface {
    name = 'Auto1769258141014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "otp" (
                "id" SERIAL NOT NULL,
                "email" character varying NOT NULL,
                "otp" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "otp"
        `);
    }

}
