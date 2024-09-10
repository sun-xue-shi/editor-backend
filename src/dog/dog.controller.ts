import { Body, Controller, Post } from '@nestjs/common';
import { DogService } from './dog.service';
import { CreateDogDto } from './dto/create-dog.dto';

@Controller('dog')
export class DogController {
  constructor(private readonly dogService: DogService) {}

  @Post('test')
  async create(@Body() info: CreateDogDto) {
    return await this.dogService.create(info);
  }
}
