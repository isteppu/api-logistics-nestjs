import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    // origin: [
    //   'http://localhost:9000',
    //   'https://your-frontend-domain.com', 
    // ],
    origin: true,
    credentials: true
  });

  await app.register(fastifyCookie, {
    secret: process.env.SECRET || ""
  })
  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
  console.log(`App is running on: ${await app.getUrl()}`)
}
bootstrap();
