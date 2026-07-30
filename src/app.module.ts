
import {
  Module,
  NestModule,
  MiddlewareConsumer,
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
import { ProfileModule } from './profile/profile.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MyTicketsModule } from './my-tickets/my-tickets.module';

// Entities
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { Comment } from './comments/entities/comment.entity';

// Guards & middleware
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
  imports: [
    // ── Config ─────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Database ───────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<number>('DB_PORT', 5432)),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: String(process.env.DB_PASSWORD || configService.get('DB_PASSWORD') || 'gotoIndustry'),
        database: configService.get<string>('DB_NAME', 'support_tickets_system'),
        entities: [User, Product, Ticket, Comment],
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    MailerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    transport: {
      host: configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: Number(configService.get<number>('SMTP_PORT', 465)),
      secure: true, // Port 465 এর জন্য secure: true হতে হবে
      auth: {
        user: configService.get<string>('SMTP_USER'),
        pass: configService.get<string>('SMTP_PASS'),
      },
    },
    defaults: {
      from: `"Support Ticket System" <${configService.get<string>('SMTP_USER')}>`,
    },
  }),
}),
    

    // ── Feature modules ────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    ProductsModule,
    TicketsModule,
    CommentsModule,
    ProfileModule,
    DashboardModule,
    MyTicketsModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}