import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import juice from 'juice';
import * as nodemailer from 'nodemailer';

interface MailSendInput {
  code?: string;
  to: string;
  subject: string;
}

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      type: 'OAuth2',
      user: 'yongsoocho578@gmail.com',
      clientId: this.config.get('GOOGLE_ID'),
      clientSecret: this.config.get('GOOGLE_SECRET'),
      refreshToken: this.config.get('GOOGLE_REFRESH'),
    },
  });

  constructor(private readonly config: ConfigService) {}

  sendMail({ code, to, subject }: MailSendInput) {
    const htmlFile = readFileSync(code ? 'index.html' : 'hello.html', 'utf-8');

    const htmlWithStyle = juice(htmlFile, {
      removeStyleTags: true,
    });

    if (code) {
      const template = Handlebars.compile(htmlWithStyle);

      const result = template({ code });

      return this.transporter.sendMail({
        from: '<안녕하세요!> yongsoocho578@gmail.com',
        to,
        subject,
        html: result,
      });
    }

    return this.transporter.sendMail({
      from: '<안녕하세요!> yongsoocho578@gmail.com',
      to,
      subject,
      html: htmlWithStyle,
    });
  }
}
