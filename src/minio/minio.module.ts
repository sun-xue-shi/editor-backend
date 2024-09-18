import { Global, Module } from '@nestjs/common';
import { MinioController } from './minio.controller';
import { MinioService } from './minio.service';
import * as Minio from 'minio';

@Global()
@Module({
  providers: [
    {
      provide: 'MINIO_CLIENT',
      async useFactory() {
        // const client = new Minio.Client({
        //   endPoint: 'localhost',
        //   port: 9000,
        //   useSSL: false,
        //   配置两个key
        // });
        // return client;
      },
    },
    MinioService,
  ],
  exports: ['MINIO_CLIENT'],
  controllers: [MinioController],
})
export class MinioModule {}
