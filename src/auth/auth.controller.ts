import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailAndPassword } from './dto/create-auth.dto';
import { JwtGuard } from 'src/common/guard/jwt.guard';
import { User } from 'src/common/decorator/jwt.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  createUser(@Body() emailAndPassword: EmailAndPassword) {
    return this.authService.create(emailAndPassword);
  }

  @UseGuards(JwtGuard)
  @Get('login')
  loginWithToken(@User() user) {
    return user;
  }

  @Post('login')
  loginUser(@Body() emailAndPassword: EmailAndPassword) {
    return this.authService.loginUser(emailAndPassword);
  }

  // 코드 발급 요청
  @Get('code')
  codeSend(@Query('email') email: string) {
    return this.authService.codeSend(email);
  }

  // 코드 체크
  @Post('code')
  codeCheck(@Body('email') email: string, @Body('code') code: string) {
    return this.authService.codeCheck(email, code);
  }

  @Post('kakao')
  kakaoLogin(@Body('code') code: string) {
    return this.authService.kakaoLogin(code);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
