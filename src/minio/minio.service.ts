import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  @Inject('MINIO_CLIENT')
  private minioClient: Minio.Client;

  @Inject(ConfigService)
  private ConfigService: ConfigService;

  async uploadFile(
    path = 'D:\\前端项目\\vue-project\\editor-backend\\public\\index.html',
    bucketName = 'editor-ssr',
    objectName = 'index.html',
  ) {
    try {
      await this.minioClient.fPutObject(bucketName, objectName, path, {
        'Content-Type': 'text/html',
      });

      const ssrUrl =
        this.ConfigService.get('minio_address') + `${bucketName}/${objectName}`;

      return {
        ssrUrl,
      };
    } catch (err) {
      console.log(err);
    }
  }
}
