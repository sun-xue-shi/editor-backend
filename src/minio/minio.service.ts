import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import * as path from 'path';

@Injectable()
export class MinioService {
  // private pathStr: path.PlatformPath;

  @Inject('MINIO_CLIENT')
  private minioClient: Minio.Client;

  @Inject(ConfigService)
  private ConfigService: ConfigService;

  async uploadFile(
    pathStr = path.join(
      __dirname.replace('\\dist', ''),
      '..',
      'public/index.html',
    ),
    bucketName = 'editor-ssr',
    objectName = 'index.html',
  ) {
    try {
      await this.minioClient.fPutObject(bucketName, objectName, pathStr, {
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
