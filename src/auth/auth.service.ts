import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmailAndPassword } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from '@lib/prisma';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { RedisService } from '@lib/redis';
import { MailerService } from '@lib/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly transporter: MailerService,
  ) {}

  signJwtToken(exUser) {
    const payload = {
      email: exUser.email,
      provider: exUser.provider,
    };

    const privateKey = fs.readFileSync('private.key');

    const accessToken = jwt.sign(payload, privateKey, {
      issuer: 'my-netflix.com',
      algorithm: 'RS256',
      expiresIn: 60 * 60,
    });

    return {
      user: payload,
      accessToken,
    };
  }

  // 클라이언트 객체.테이블.쿼리
  async create(emailAndPassword: EmailAndPassword) {
    const exUser = await this.prisma.findUserByEmail(emailAndPassword.email);

    if (exUser)
      throw new HttpException('이미 있는 유저입니다.', HttpStatus.BAD_REQUEST);

    const newUser = await this.prisma.user.create({
      data: {
        email: emailAndPassword.email,
        password: await bcrypt.hash(emailAndPassword.password, 10),
      },
    });

    const codeCheck = await this.redis.getRedis().get(emailAndPassword.email);

    if (codeCheck != 'OK')
      throw new HttpException(
        '이메일 인증을 먼저 해주세요!',
        HttpStatus.FORBIDDEN,
      );

    return this.signJwtToken(newUser);
  }

  async loginUser(emailAndPassword: EmailAndPassword) {
    const exUser = await this.prisma.findUserByEmail(emailAndPassword.email);

    if (!exUser)
      throw new HttpException('없는 유저입니다.', HttpStatus.NOT_FOUND);

    const result = await bcrypt.compare(
      emailAndPassword.password,
      exUser.password,
    );

    if (!result)
      throw new HttpException(
        '비밀 번호가 틀렸습니다.',
        HttpStatus.BAD_REQUEST,
      );

    return this.signJwtToken(exUser);
  }

  async codeSend(email: string) {
    const code: number = Math.floor(Math.random() * 10000);

    // 이메일로 코드를 담아서 보냄
    this.transporter.sendMail({
      code: String(code),
      to: email,
      subject: '안녕하세요 코드번호 드립니다.',
    });

    this.redis.getRedis().set(email, String(code), 'EX', '300');

    return true;
  }

  async codeCheck(email: string, code: string) {
    const rcode: string = await this.redis.getRedis().get(email);
    console.log(rcode);

    if (code !== rcode)
      throw new HttpException('코드가 틀렸습니다.', HttpStatus.BAD_REQUEST);

    this.redis.getRedis().set(email, 'OK', 'EX', '600');

    return true;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
