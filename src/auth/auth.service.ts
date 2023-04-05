import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EmailAndPassword } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from '@lib/prisma';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { RedisService } from '@lib/redis';
import { MailerService } from '@lib/mailer';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import * as qs from 'qs';

interface ResultKakaoToken {
  access_token: string;
  token_type: 'bearer';
  refresh_token: string;
  expires_in: number;
  scope: 'account_email';
  refresh_token_expires_in: number;
}

interface ResultKakaoUser {
  id: number;
  connected_at: Date;
  kakao_account: {
    has_email: boolean;
    email_needs_agreement: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_SERVICE') private readonly redis: RedisService,
    private readonly transporter: MailerService,
    private readonly config: ConfigService,
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

  async getKakaoUser(code: string): Promise<ResultKakaoUser> {
    const client_id = this.config.get('KAKAO_CLI');

    const { access_token }: Awaited<ResultKakaoToken> = await axios({
      method: 'POST',
      url: 'https://kauth.kakao.com/oauth/token',
      data: qs.stringify({
        grant_type: 'authorization_code',
        client_id,
        redirect_uri: 'http://localhost:3000/redirect',
        code,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    })
      .then((res) => res.data)
      .catch((e) => console.log(e.message));

    return axios
      .get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })
      .then((res) => res.data)
      .catch((e) => console.log(e.message));
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

    const codeCheck = await this.redis.get(emailAndPassword.email);

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

    this.redis.set(email, String(code), '300');

    return true;
  }

  async codeCheck(email: string, code: string) {
    const rcode: string = await this.redis.get(email);
    console.log(rcode);

    if (code !== rcode)
      throw new HttpException('코드가 틀렸습니다.', HttpStatus.BAD_REQUEST);

    this.redis.set(email, 'OK', '600');

    return true;
  }

  async kakaoLogin(code: string) {
    const {
      id,
      kakao_account: { email },
    } = await this.getKakaoUser(code);

    const exUser = await this.prisma.findUserByEmail(email);

    // 회원 가입 + 로그인
    if (!exUser) {
      const newUser = await this.prisma.user.create({
        data: {
          email,
          provider: 'KAKAO',
          snsId: String(id),
        },
      });

      this.transporter.sendMail({
        to: newUser.email,
        subject: `${newUser.email.split('@')[0]} 님 가입해주셔서 감사합니다!`,
      });

      return this.signJwtToken(newUser);
    }

    // 있다면 -> 바로 로그인
    return this.signJwtToken(exUser);
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
