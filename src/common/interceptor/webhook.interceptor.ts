import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, map, of } from 'rxjs';
import * as Sentry from '@sentry/node';
import { IncomingWebhook } from '@slack/webhook';
// import

@Injectable()
export class WebHookInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // 로직들...

    console.log('컨트롤러 가기전에..');
    const statusCode = context.switchToHttp().getResponse().statusCode;

    // ReactiveX -> 반응형 프로그래밍
    // RxJS RxJava 드응....
    return next.handle().pipe(
      map((data) => {
        console.log('컨트롤러 간 후');

        return data;
      }),
      catchError((e) => {
        Sentry.captureException(e);

        const webhook = new IncomingWebhook(process.env.SLACK);

        (async () => {
          await webhook.send({
            attachments: [
              {
                color: 'danger',
                text: '위험합니다!!',
                fields: [
                  {
                    title: `에러 메세지: ${e.message}`,
                    value: e.stack,
                    short: false,
                  },
                ],
              },
            ],
          });
        })();

        return of({
          message: e.message,
        });
      }),
    );
  }
}
