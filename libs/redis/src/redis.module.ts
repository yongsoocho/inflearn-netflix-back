import { Global, Inject, MiddlewareConsumer, Module } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { ConfigService } from "@nestjs/config";
import session from "express-session";
import RedisStore from "connect-redis";
import cookieParser from "cookie-parser";

const RedisFactory = {
  provide: "REDIS_SERVICE",
  useFactory: async (config: ConfigService) => {
    const host = config.get("REDIS_HOST");
    const password = config.get("REDIS_PW");

    return new RedisService(host, password);
  },
  inject: [ConfigService],
};
@Global()
@Module({
  providers: [ConfigService, RedisFactory],
  exports: [RedisFactory],
})
export class RedisModule {
  constructor(@Inject("REDIS_SERVICE") private readonly redis: RedisService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieParser(),
        session({
          store: new RedisStore({
            client: this.redis.getRedis(),
          }),
          saveUninitialized: true,
          secret: "my-secrete",
          resave: true,
          cookie: {
            // sameSite: true,
            // httpOnly: true,
            // secure: true,
            maxAge: 60 * 60 * 60,
          },
        }),
      )
      .forRoutes("*");
  }
}
