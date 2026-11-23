import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Serve static uploads
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('CampusFlow REST API')
    .setDescription('Unified Campus Super-App API specification for Haramaya University pilot')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  app.getHttpAdapter().get('/api/docs-json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  // Root redirect to Swagger docs and silent favicon handler
  app.getHttpAdapter().get('/', (req: any, res: any) => {
    res.redirect('/api/docs');
  });
  app.getHttpAdapter().get('/favicon.ico', (req: any, res: any) => {
    res.status(204).end();
  });

  // Base /api/v1 service health and discovery response
  app.getHttpAdapter().get('/api/v1', (req: any, res: any) => {
    res.json({
      name: 'CampusFlow REST API',
      version: '1.0.0',
      status: 'healthy',
      institution: 'Haramaya University (Main Campus, Bate)',
      timestamp: new Date().toISOString(),
      docs: '/api/docs',
      endpoints: {
        campuses: '/api/v1/campuses',
        businesses: '/api/v1/businesses',
        products: '/api/v1/products',
        orders: '/api/v1/orders',
        transport: '/api/v1/transport',
        housing: '/api/v1/housing',
        events: '/api/v1/events',
        learning: '/api/v1/learning',
        bookings: '/api/v1/bookings',
        wallet: '/api/v1/wallet',
        cafeteria: '/api/v1/cafeteria',
        student: '/api/v1/student',
        announcements: '/api/v1/announcements',
        notifications: '/api/v1/notifications',
      },
    });
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`[API] CampusFlow API is running on: http://localhost:${port}/api/v1`);
  console.log(`[DOCS] Swagger Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
