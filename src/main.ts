import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as Sentry from "@sentry/node";
import { WebHookInterceptor } from "./common/interceptor/webhook.interceptor";
import * as morgan from "morgan";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  Sentry.init({
    dsn: process.env.SENTRY,
  });

  app.enableCors({
    origin: ["*", "http://front-service:3000", "http://localhost:3000"],
    credentials: true,
  });
  app.useGlobalInterceptors(new WebHookInterceptor());
  app.use(morgan("combined"));
  await app.listen(4000);
}
bootstrap();
