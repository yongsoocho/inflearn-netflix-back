import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MovieModule } from './movie/movie.module';
import { MovieModule } from './movie/movie.module';
import { PrismaModule } from '../libs/db/src/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@lib/redis';
import { MovieModule } from './movie/movie.module';

@Module({
  imports: [
    AuthModule,
    MovieModule,
    PrismaModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
