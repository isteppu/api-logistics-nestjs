import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  
  // This is the "Engine" for validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // Strips away any properties not in the DTO
    forbidNonWhitelisted: true, // Throws error if unexpected properties are sent
    transform: true,      // Automatically converts types (e.g., string to number)
  }));

  await app.register(fastifyCookie, {
    secret: process.env.SECRET || ""
  })
  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
  console.log(`App is running on: ${await app.getUrl()}`)
}
bootstrap();
