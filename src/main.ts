import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as Sentry from "@sentry/node";
import { WebHookInterceptor } from "./common/interceptor/webhook.interceptor";
import morgan from "morgan";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  Sentry.init({
    dsn: process.env.SENTRY,
  });

  app.enableCors({
    origin: ["http://localhost:3000", "http://front-service:3000", "*"],
    credentials: true,
  });

  app.use(morgan("combined"));

  app.useGlobalInterceptors(new WebHookInterceptor());
  await app.listen(4000);
}
bootstrap();
