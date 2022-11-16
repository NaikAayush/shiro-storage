import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

import dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  if (process.env.PORT) {
    await app.listen(process.env.PORT);
  } else {
    throw Error('PORT missing from .env');
  }
}
bootstrap();
