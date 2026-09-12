import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRatingToTickets1785600000000 implements MigrationInterface {
  name = 'AddRatingToTickets1785600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tickets"
        ADD COLUMN IF NOT EXISTS "rating" smallint,
        ADD COLUMN IF NOT EXISTS "ratingComment" character varying(500),
        ADD COLUMN IF NOT EXISTS "ratedAt" timestamp
    `);

    await queryRunner.query(`
      ALTER TABLE "tickets"
        ADD CONSTRAINT "CHK_tickets_rating_range"
        CHECK ("rating" IS NULL OR ("rating" >= 1 AND "rating" <= 5))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tickets"
        DROP CONSTRAINT IF EXISTS "CHK_tickets_rating_range"
    `);

    await queryRunner.query(`
      ALTER TABLE "tickets"
        DROP COLUMN IF EXISTS "rating",
        DROP COLUMN IF EXISTS "ratingComment",
        DROP COLUMN IF EXISTS "ratedAt"
    `);
  }
}