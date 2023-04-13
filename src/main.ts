import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as Sentry from "@sentry/node";
import { WebHookInterceptor } from "./common/interceptor/webhook.interceptor";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import { RedisService } from "@lib/redis";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  Sentry.init({
    dsn: process.env.SENTRY,
  });

  app.enableCors({
    origin: ["http://localhost:3000", "http://front-service:3000", "*"],
    credentials: true,
  });

  app.use(cookieParser());
  app.use(
    session({
      secret: "my-secret",
      store: new RedisService().getCli(),
      resave: true,
      saveUninitialized: false,
      cookie: {
        // httpOnly: true
        // secure: true
        maxAge: 60 * 60,
      },
    }),
  );
  app.use(morgan("combined"));

  app.useGlobalInterceptors(new WebHookInterceptor());
  await app.listen(4000);
}
bootstrap();
