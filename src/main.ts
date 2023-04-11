import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { WebHookInterceptor } from './common/interceptor/webhook.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  Sentry.init({
    dsn: process.env.SENTRY,
  });

  app.useGlobalInterceptors(new WebHookInterceptor());

  await app.listen(4000);
}
bootstrap();
