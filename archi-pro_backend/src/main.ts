import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const useLocalHttps = (process.env.USE_LOCAL_HTTPS ?? '').toLowerCase() === 'true';

  const createOptions = useLocalHttps && fs.existsSync('certs/key.pem') && fs.existsSync('certs/cert.pem')
    ? {
        httpsOptions: {
          key: fs.readFileSync('certs/key.pem'),
          cert: fs.readFileSync('certs/cert.pem'),
        },
      }
    : undefined;

  const app = createOptions ? await NestFactory.create(AppModule, createOptions) : await NestFactory.create(AppModule);

  const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  console.log('CORS allowed origins:', allowedOrigins.length === 0 ? '[all]' : allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });
  
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
