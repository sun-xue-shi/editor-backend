import { Injectable } from '@nestjs/common';
import { CreateDogDto } from './dto/create-dog.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Dog } from './entities/dog.entities';

@Injectable()
export class DogService {
  @InjectModel(Dog.name)
  private dogModel: Model<Dog>;

  create(createDogDto: CreateDogDto) {
    const dog = new this.dogModel(createDogDto);
    return dog.save();
  }

  findAll() {
    return this.dogModel.find();
  }

  findOne(id: string) {
    return this.dogModel.findById(id);
  }

  remove(id: number) {
    return this.dogModel.findByIdAndDelete(id);
  }
}
