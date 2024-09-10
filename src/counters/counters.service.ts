import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Counters } from './schema/counters.entities';
import { Model } from 'mongoose';

@Injectable()
export class CountersService {
  @InjectModel(Counters.name)
  private countersModel: Model<Counters>;

  async getNextSequenceValue(sepName: string) {
    const sequenceDocument = await this.countersModel.findOneAndUpdate(
      {
        collection: sepName,
      },
      { $inc: { seq_value: 1 } },
      { new: true },
    );

    return sequenceDocument.seq_value;
  }
}
