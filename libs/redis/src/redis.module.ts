import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';

const RedisFactory = {
  provide: 'REDIS_SERVICE',
  useFactory: async (config: ConfigService) => {
    const host = config.get('REDIS_HOST');
    const password = config.get('REDIS_PW');
    return new RedisService(host, password);
  },
  inject: [ConfigService],
};
console.log(RedisFactory);
@Global()
@Module({
  providers: [ConfigService, RedisFactory],
  exports: [RedisFactory],
})
export class RedisModule {}
