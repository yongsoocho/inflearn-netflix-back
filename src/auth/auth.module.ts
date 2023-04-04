import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '@lib/prisma';
import { RedisModule } from '@lib/redis';
import { MailerModule, MailerService } from '@lib/mailer';

@Module({
  imports: [MailerModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, RedisModule, MailerService],
})
export class AuthModule {}
