import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1784877389692 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "role_enum" AS ENUM ('Customer', 'Manager', 'Admin');
    `);

    await queryRunner.query(`
      CREATE TYPE "ticket_status_enum" AS ENUM ('Open', 'InProgress', 'Resolved', 'Closed');
    `);

    await queryRunner.query(`
      CREATE TYPE "ticket_priority_enum" AS ENUM ('Low', 'Medium', 'High', 'Urgent');
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "email" character varying(255) NOT NULL UNIQUE,
        "password" character varying NOT NULL,
        "role" "role_enum" NOT NULL DEFAULT 'Customer',
        "refreshToken" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying(150) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "tickets" (
        "id" SERIAL PRIMARY KEY,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "status" "ticket_status_enum" NOT NULL DEFAULT 'Open',
        "priority" "ticket_priority_enum" NOT NULL DEFAULT 'Medium',
        "customerId" integer NOT NULL,
        "assigneeId" integer,
        "productId" integer,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "FK_ticket_customer" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ticket_assignee" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_ticket_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" SERIAL PRIMARY KEY,
        "content" text NOT NULL,
        "ticketId" integer NOT NULL,
        "authorId" integer NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "FK_comment_ticket" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comment_author" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "comments";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tickets";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_priority_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "role_enum";`);
  }
}
