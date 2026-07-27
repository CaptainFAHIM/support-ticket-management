// Fahim
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * AddEscalationColumnsToTickets
 *
 * Adds the isEscalated and escalatedAt columns to the tickets table.
 * These columns are required by the Ticket entity and TicketsService
 * (escalateTicket method), but were absent from the initial migration.
 *
 * isEscalated  — boolean flag, default false.
 * escalatedAt  — nullable timestamp set when a ticket is escalated.
 */
export class AddEscalationColumnsToTickets1784962177278
  implements MigrationInterface
{
  name = 'AddEscalationColumnsToTickets1784962177278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tickets"
        ADD COLUMN IF NOT EXISTS "isEscalated" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "escalatedAt" TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tickets"
        DROP COLUMN IF EXISTS "escalatedAt",
        DROP COLUMN IF EXISTS "isEscalated"
    `);
  }
}
