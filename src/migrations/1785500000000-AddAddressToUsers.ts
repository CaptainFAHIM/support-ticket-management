import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressToUsers1785500000000 implements MigrationInterface {
  name = 'AddAddressToUsers1785500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "address" character varying(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "address"
    `);
  }
}