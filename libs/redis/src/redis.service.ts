import { BeforeApplicationShutdown, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements BeforeApplicationShutdown {
  private _redis: Redis;

  constructor(private readonly host, private readonly password) {
    this._redis = new Redis({
      host,
      port: 16363,
      password,
      lazyConnect: true,
    });
  }

  getRedis() {
    if (this._redis) return this._redis;

    this._redis = new Redis({
      host: this.host,
      port: 16363,
      password: this.password,
    });

    return this._redis;
  }

  set(key: string, value: string, expireTime: string) {
    // this.redis.getRedis().set(email, String(code), 'EX', '300');
    return this._redis.set(key, value, 'EX', expireTime);
  }

  get(key: string) {
    return this._redis.get(key);
  }

  async beforeApplicationShutdown() {
    this._redis.disconnect();
  }
}
