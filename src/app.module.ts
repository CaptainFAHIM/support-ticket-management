import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { TicketsModule } from './tickets/tickets.module';
import { CommentsModule } from './comments/comments.module';

// Entities
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { Comment } from './comments/entities/comment.entity';

// Guards & middleware
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

/**
 * AppModule — root module of the application.
 *
 * Database connection is configured via environment variables.
 * All feature modules are imported here.
 *
 * Global guards:
 *  1. JwtAuthGuard  — ensures every route requires a valid JWT by default.
 *  2. RolesGuard    — enforces @Roles() metadata on protected routes.
 *
 * Global middleware:
 *  - LoggingMiddleware applied to all routes ('*').
 *
 * Environment variables required (.env):
 *  DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
 *  JWT_SECRET, JWT_EXPIRES_IN
 */
@Module({
  imports: [
    // ── Config ─────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Database ───────────────────────────────────────────────────────────
    //Nadia
    TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', ''),
    database: configService.get<string>('DB_NAME', 'support_tickets'),
    entities: [User, Product, Ticket, Comment],
  synchronize: false,
    logging: configService.get<string>('NODE_ENV') === 'development',
  }),
}),

// ── Mailer ─────────────────────────────────────────────────────────────
//Nadia
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        ignoreTLS: true,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
    }),


    // ── Feature modules ────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    ProductsModule,
    TicketsModule,
    CommentsModule,
  ],

  providers: [
    // Apply JwtAuthGuard globally — all routes require auth by default.
    // To make a route public, add a @Public() decorator (to be implemented).
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Apply RolesGuard globally after JwtAuthGuard.
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Registers global middleware.
   * LoggingMiddleware is applied to ALL routes ('*').
   *
   * Add rate-limiting, CORS, or other cross-cutting middleware here.
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
