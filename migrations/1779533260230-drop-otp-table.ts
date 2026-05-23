import { MigrationInterface, QueryRunner } from "typeorm";

export class DropOtpTable1779533260230 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "otp"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Table was deleted becauseOTP was moved to Redis
    }

}
