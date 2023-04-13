import {
  BeforeApplicationShutdown,
  CACHE_MANAGER,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class RedisService implements BeforeApplicationShutdown {
  // private _redis: Redis;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly _redis: Cache,
  ) {}

  getCli() {
    return this._redis;
  }

  set(key: string, value: string, expireTime: string) {
    // this.redis.getRedis().set(email, String(code), 'EX', '300');
    return this._redis.set(key, value, +expireTime);
  }

  get(key: string): Promise<string> {
    return this._redis.get(key);
  }

  async beforeApplicationShutdown() {
    // this._redis.disconnect();
  }
}
