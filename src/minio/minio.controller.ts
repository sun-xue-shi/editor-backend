import { Controller, Get } from '@nestjs/common';
import { MinioService } from './minio.service';

@Controller('minio')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Get('minio-upload')
  async minioUpload() {
    const objectName = 'index.html';
    return await this.minioService.uploadFile(
      'D:\\前端项目\\vue-project\\editor-backend\\public\\index.html',
      'editor-ssr',
      objectName,
    );
  }
}
