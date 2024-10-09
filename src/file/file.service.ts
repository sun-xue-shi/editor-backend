import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  @Inject(ConfigService)
  private configService: ConfigService;

  async uploadImage(files: Array<Express.Multer.File>) {
    const thumbnailUrl = [];
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i].path;
      const imageRes = sharp(filePath);
      const imageInfo = await imageRes.metadata();

      if (imageInfo.width && imageInfo.width > 300) {
        const { dir, name, ext } = path.parse(filePath);
        const thumbnailPath = path.join(dir, `${name}-thumbnail${ext}`);

        await imageRes.resize({ width: 300 }).toFile(thumbnailPath);
        thumbnailUrl.push(thumbnailPath);
      }
    }

    return {
      url: files.map((file) =>
        (this.configService.get('nest_address') + file.path).replace(
          /\s/g,
          '%20',
        ),
      ),
      thumbnailUrl: thumbnailUrl.map((file) =>
        (this.configService.get('nest_address') + file).replace(/\s/g, '%20'),
      ),
    };
  }

  async merge(name: string, hash: string) {
    const chunkDir = 'uploads/chunks_' + hash;

    const files = fs.readdirSync(chunkDir);

    files.sort((file1, file2) => {
      const index1 = +file1.split('@')[1];
      const index2 = +file2.split('@')[1];

      return index1 - index2;
    });

    let count = 0;
    let startPos = 0;

    for (const file of files) {
      const filePath = chunkDir + '/' + file;
      const stream = fs.createReadStream(filePath);

      stream
        .pipe(
          fs.createWriteStream(`uploads/${hash}_${name}`, {
            start: startPos,
          }),
        )
        .on('error', () => {
          throw new HttpException('分片上传失败', HttpStatus.BAD_REQUEST);
        })
        .on('finish', () => {
          count++;
          if (count === files.length) {
            fs.rm(chunkDir, { recursive: true }, () => {
              console.log(`${count}-${startPos}`);
            });
          }
        });

      startPos += fs.statSync(filePath).size;
    }

    return {
      url: (
        this.configService.get('nest_address') +
        'uploads/' +
        hash +
        '_' +
        name
      ).replace(/\s/g, '%20'),
    };
  }

  async checkChunks(name: string, hash: string, chunkTotal: number) {
    const checkVo = {
      checkStatus: 'empty',
      chunkStatusArr: [],
      url: '',
    };

    const filePath = 'uploads/' + hash + '_' + name;
    if (fs.existsSync(filePath)) {
      checkVo.checkStatus = 'uploaded';
      checkVo.url = (
        this.configService.get('nest_address') +
        'uploads/' +
        hash +
        '_' +
        name
      ).replace(/\s/g, '%20');
    }

    const chunkDir = 'uploads/chunks_' + hash;

    if (fs.existsSync(chunkDir)) {
      const files = fs.readdirSync(chunkDir);
      const chunkStatusArr = new Array<number>(chunkTotal).fill(0);

      if (files && files.length > 0) {
        files.map((file) => {
          const index = +file.split('@')[1];
          chunkStatusArr[index] = 1;
        });
        checkVo.checkStatus = 'less';
      }
      checkVo.chunkStatusArr = chunkStatusArr;
    }

    return checkVo;
  }
}
