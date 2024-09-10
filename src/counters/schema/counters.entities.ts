import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Counters {
  @Prop({ required: true, unique: true })
  _id: string;

  @Prop({ required: true })
  seq_value: number;
}

export type CountersDocument = HydratedDocument<Counters>;

export const CountersSchema = SchemaFactory.createForClass(Counters);
