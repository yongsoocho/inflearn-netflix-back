import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private _redis: Redis;

  constructor(private readonly config: ConfigService) {
    console.log(this.config.get('REDIS_HOST'));
    this._redis = new Redis({
      host: this.config.get<string>('REDIS_HOST'),
      port: 16363,
      password: this.config.get<string>('REDIS_PW'),
    });
  }

  getRedis() {
    if (this._redis) return this._redis;

    this._redis = new Redis({
      host: this.config.get<string>('REDIS_HOST'),
      port: 16363,
      password: this.config.get<string>('REDIS_PW'),
    });

    return this._redis;
  }

  async enableShutdownHooks() {
    this._redis.disconnect();
  }
}
