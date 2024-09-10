import { Module } from '@nestjs/common';
import { DogService } from './dog.service';
import { DogController } from './dog.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Dog, DogSchema } from './entities/dog.entities';

@Module({
  imports: [MongooseModule.forFeature([{ name: Dog.name, schema: DogSchema }])],
  controllers: [DogController],
  providers: [DogService],
})
export class DogModule {}
