import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors();
   // Swagger solo en dev (recomendado)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Affiliate Tracking API')
      .setDescription('Endpoints del MVP: ingest y reports')
      .setVersion('0.1.0')
      // .addBearerAuth() // cuando tengas auth
      .addTag('ingest')
      .addTag('reports')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    // JSON directo (útil para compartir el spec)
    app.getHttpAdapter().get('/docs/json', (_req, res) => res.json(document));
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
