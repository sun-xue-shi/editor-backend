import { Inject, Injectable } from '@nestjs/common';
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

    files.map((file, index) => {
      const filePath = chunkDir + '/' + file;
      const stream = fs.createReadStream(filePath);
      stream
        .pipe(
          fs.createWriteStream(`uploads/${hash}_${name}`, {
            start: startPos,
          }),
        )
        .on('finish', () => {
          count++;
          if (count === files.length) {
            fs.rm(chunkDir, { recursive: true }, () => {});
            console.log(`${index}-${count}-${startPos}`);
            return 1;
          }
        });

      startPos += fs.statSync(filePath).size;
    });

    // return new Promise((resolve) => {
    //   const mergeFiles = fs.readdirSync('uploads/');
    //   console.log('mergeFiles', mergeFiles);

    //   resolve({
    //     url: mergeFiles.map((file) =>
    //       (this.configService.get('nest_address') + 'uploads/' + file).replace(
    //         /\s/g,
    //         '%20',
    //       ),
    //     ),
    //   });
    // });
  }
}
