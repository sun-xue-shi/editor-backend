import { Inject, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
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
}
