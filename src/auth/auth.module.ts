import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '@lib/prisma';
import { MailerModule, MailerService } from '@lib/mailer';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [MailerModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, MailerService, ConfigService],
})
export class AuthModule {}
