import {
  CacheModule,
  Global,
  Inject,
  MiddlewareConsumer,
  Module,
} from "@nestjs/common";
import { RedisService } from "./redis.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as redisStore from "cache-manager-ioredis";
import session from "express-session";
import * as RedisStore from "connect-redis";

const RedisFactory = {
  provide: "REDIS_SERVICE",
  useClass: RedisService,
};
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.get("REDIS_HOST"),
        port: 16363,
        username: "default",
        password: configService.get("REDIS_PW"),
      }),
    }),
  ],
  providers: [ConfigService, RedisFactory],
  exports: [RedisFactory],
})
export class RedisModule {
  constructor(@Inject("REDIS_SERVICE") private readonly redis: RedisService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      session({
        secret: "my-secret",
        store: this.redis.getCli(),
        resave: true,
        saveUninitialized: false,
        cookie: {
          // httpOnly: true
          // secure: true
          maxAge: 60 * 60,
        },
      }),
    );
  }
}
