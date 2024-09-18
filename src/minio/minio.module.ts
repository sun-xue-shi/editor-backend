import { Global, Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import * as Minio from 'minio';

@Global()
@Module({
  providers: [
    {
      provide: 'MINIO_CLIENT',
      async useFactory() {
        const client = new Minio.Client({
          endPoint: 'localhost',
          port: 9000,
          useSSL: false,
          accessKey: 'slyrTL8Lx6xtTDJLjPaX',
          secretKey: '8V7n95naJptZ0wmjJKH7daBSNusZQlS0qc3HFjFv',
        });
        return client;
      },
    },
    MinioService,
  ],
  exports: ['MINIO_CLIENT', MinioService],
})
export class MinioModule {}
