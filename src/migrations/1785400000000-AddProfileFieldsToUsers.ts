// Mehrab
import { MigrationInterface, QueryRunner } from 'typeorm';


export class AddProfileFieldsToUsers1785400000000 implements MigrationInterface {
  name = 'AddProfileFieldsToUsers1785400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "name" character varying(100),
        ADD COLUMN IF NOT EXISTS "contactNumber" character varying(20),
        ADD COLUMN IF NOT EXISTS "profilePicture" character varying(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "profilePicture",
        DROP COLUMN IF EXISTS "contactNumber",
        DROP COLUMN IF EXISTS "name"
    `);
  }
}