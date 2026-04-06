import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1775484443139 implements MigrationInterface {
    name = 'Auto1775484443139'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "collection_items" (
                "id" SERIAL NOT NULL,
                "collection_id" integer NOT NULL,
                "tmdb_id" integer NOT NULL,
                "position" integer NOT NULL DEFAULT '0',
                CONSTRAINT "UQ_fe41468b4b2f5b0b1f94d41d861" UNIQUE ("collection_id", "tmdb_id"),
                CONSTRAINT "PK_0ffb99f9dfd7f5c85f0ccaa00f9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0f16b27c93df83264343ae57b5" ON "collection_items" ("collection_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "collections" (
                "id" SERIAL NOT NULL,
                "parent_id" integer,
                "slug" character varying(100) NOT NULL,
                "title" character varying(255) NOT NULL,
                "logo_url" character varying(500),
                "media_type" character varying(10) NOT NULL,
                "source_type" character varying(20) NOT NULL,
                "tmdb_endpoint" character varying(255),
                "tmdb_params" jsonb,
                "position" integer NOT NULL DEFAULT '0',
                "is_active" boolean NOT NULL DEFAULT true,
                "backdrop_url" character varying(500),
                "color_hex" character varying(7),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"),
                CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_88cea2dc9c31951d06437879b4" ON "collections" ("parent_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items"
            ADD CONSTRAINT "FK_0f16b27c93df83264343ae57b5f" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "collections" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items" DROP CONSTRAINT "FK_0f16b27c93df83264343ae57b5f"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_88cea2dc9c31951d06437879b4"
        `);
        await queryRunner.query(`
            DROP TABLE "collections"
        `);
        await queryRunner.query(`
            DROP INDEX "meowie"."IDX_0f16b27c93df83264343ae57b5"
        `);
        await queryRunner.query(`
            DROP TABLE "collection_items"
        `);
    }

}
