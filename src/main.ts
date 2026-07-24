//Nadia

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';


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

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Support Ticket Management API')
    .setDescription(
      'Authentication, manager onboarding, and ticket workflow endpoints.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}/api`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
}
bootstrap();
//Nadia