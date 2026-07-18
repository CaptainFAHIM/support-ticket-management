import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application.
 *
 * Global configuration applied here:
 *  - ValidationPipe with whitelist + forbidNonWhitelisted for DTO safety.
 *  - CORS enabled (configure origins for production).
 *
 * TODO:
 *  - Add Swagger/OpenAPI documentation (SwaggerModule.setup).
 *  - Configure a production-grade logger (e.g. Winston).
 *  - Add Helmet for security headers.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix — all routes will be prefixed with /api
  app.setGlobalPrefix('api');

  // Validate and strip unknown properties from all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend integration (restrict origins in production)
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}/api`);
}

bootstrap();
