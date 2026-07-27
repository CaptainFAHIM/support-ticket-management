// Fahim
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * DropIsActiveFromProducts
 *
 * Removes the isActive column from the products table.
 * Products are now simply either present or deleted — no toggle state.
 */
export class DropIsActiveFromProducts1784962177279
  implements MigrationInterface
{
  name = 'DropIsActiveFromProducts1784962177279';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products" DROP COLUMN IF EXISTS "isActive"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true
    `);
  }
}
