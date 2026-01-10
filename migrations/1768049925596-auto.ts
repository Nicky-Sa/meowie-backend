import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1768049925596 implements MigrationInterface {
    name = 'Auto1768049925596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "saved" (
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                "tmdbId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_d081d7d25b4d7ba25506aa432e3" UNIQUE ("userId", "tmdbId"),
                CONSTRAINT "PK_cb4672121c11ed3824acc8d0985" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_920dd054f0294f7a36ba136151" ON "saved" ("userId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8caf6ffe464f733b3279e73e1f" ON "saved" ("tmdbId")
        `);
        await queryRunner.query(`
            ALTER TABLE "saved"
            ADD CONSTRAINT "FK_920dd054f0294f7a36ba136151f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "saved" DROP CONSTRAINT "FK_920dd054f0294f7a36ba136151f"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_8caf6ffe464f733b3279e73e1f"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_920dd054f0294f7a36ba136151"
        `);
        await queryRunner.query(`
            DROP TABLE "saved"
        `);
    }

}
