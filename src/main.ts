import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { corsOptions } from './auth/config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        exposeUnsetFields: false,
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors(corsOptions);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
