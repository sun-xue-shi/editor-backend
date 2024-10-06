import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { storage } from './utils';
import * as fs from 'fs';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads',
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
      fileFilter: (
        req: any,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile?: boolean) => void,
      ) => {
        // 检查文件是否是图片
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return cb(new Error('只能上传图片'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    return await this.fileService.uploadImage(files);
  }

  /* 上传大文件 */
  @Post('big-upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads',
    }),
  )
  uploadBigFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() { name, hash }: { name: string; hash: string },
  ) {
    const chunkDir = 'uploads/chunks_' + hash;

    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }

    fs.cpSync(files[0].path, chunkDir + '/' + name);

    fs.rmSync(files[0].path);
  }

  @Get('merge')
  async fileMerge(@Query('name') name: string, @Query('hash') hash: string) {
    return await this.fileService.merge(name, hash);
  }
}
