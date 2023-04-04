import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private _redis: Redis;

  constructor(private readonly host, private readonly password) {
    this._redis = new Redis({
      host,
      port: 16363,
      password,
    });
  }

  getRedis() {
    // console.log(this._redis);
    if (this._redis) return this._redis;

    this._redis = new Redis({
      host: this.host,
      port: 16363,
      password: this.password,
    });

    return this._redis;
  }

  async beforeApplicationShutdown() {
    this._redis.disconnect();
  }
}
