import { Inject, Injectable } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  @Inject('MINIO_CLIENT')
  private minioClient: Minio.Client;
  async uploadFile(
    path = 'D:\\前端项目\\vue-project\\editor-backend\\public\\index.html',
    bucketName = 'editor-ssr',
    objectName = 'index.html',
  ) {
    try {
      await this.minioClient.fPutObject(bucketName, objectName, path, {
        'Content-Type': 'text/html',
      });

      return {
        ssrUrl: 'http://localhost:9000/editor-ssr/index.html',
      };
    } catch (err) {
      console.log(err);
    }
  }
}
