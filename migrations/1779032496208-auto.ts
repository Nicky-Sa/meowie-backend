import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1779032496208 implements MigrationInterface {
    name = 'Auto1779032496208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "collections" DROP COLUMN "created_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "collections" DROP COLUMN "updated_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "collections" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "collections" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "collection_items" DROP COLUMN "createdAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "collections"
            ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    }

}
