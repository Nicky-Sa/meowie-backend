import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1769874506612 implements MigrationInterface {
    name = 'Auto1769874506612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "library_items" (
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                "tmdbId" integer NOT NULL,
                "mediaType" character varying NOT NULL,
                "category" character varying NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_5ddbd366eb81981845e3037265d" UNIQUE ("userId", "tmdbId", "mediaType", "category"),
                CONSTRAINT "PK_373853d99451df2762ce3a102c2" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ff96f8f336db4dc59b3f13a3fe" ON "library_items" ("userId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_83112d3219ae59ac79f41c0c01" ON "library_items" ("tmdbId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_737ad0ae3e54de1a3031ee6d21" ON "library_items" ("mediaType")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3e80cb28640232ea5a48cacd96" ON "library_items" ("category")
        `);
        await queryRunner.query(`
            ALTER TABLE "library_items"
            ADD CONSTRAINT "FK_ff96f8f336db4dc59b3f13a3fe0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "library_items" DROP CONSTRAINT "FK_ff96f8f336db4dc59b3f13a3fe0"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_3e80cb28640232ea5a48cacd96"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_737ad0ae3e54de1a3031ee6d21"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_83112d3219ae59ac79f41c0c01"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_ff96f8f336db4dc59b3f13a3fe"
        `);
        await queryRunner.query(`
            DROP TABLE "library_items"
        `);
    }

}
