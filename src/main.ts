import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { FormatResponseInterceptor } from './format-response.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as ejs from 'ejs';
import { Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets('uploads', {
    prefix: '/uploads',
    setHeaders(res: Response) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  });

  // app.useStaticAssets('public'); //静态文件
  app.setBaseViewsDir('views'); //模板引擎目录
  app.setViewEngine('ejs'); //模板渲染引擎
  app.engine('html', ejs.renderFile);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  app.enableCors({ origin: '*' });

  await app.listen(3000);
}
bootstrap();
