import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers['authorization'].split(' ')[1];

    const publicKey = fs.readFileSync('public.key');

    jwt.verify(
      token,
      publicKey,
      {
        issuer: 'my-netflix.com',
        algorithms: ['RS256'],
        ignoreExpiration: false,
      },
      (error, decode) => {
        if (error)
          throw new HttpException(
            '유효하지 않은 토큰입니다.',
            HttpStatus.UNAUTHORIZED,
          );

        if (decode) {
          request.user = decode;
        }
      },
    );

    return true;
  }
}
