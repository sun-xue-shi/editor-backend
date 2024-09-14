import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class Work {
  id: number;

  @Prop({ required: true, unique: true })
  uuid: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  desc: string;

  coverImg: string;

  content?: Record<string, any>;

  isTemplate?: boolean;

  isPublic?: boolean;

  isHot?: boolean;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  copiedCount: number;

  status?: 0 | 1 | 2;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
}

export type WorkDocument = HydratedDocument<Work>;

export const WorkSchema = SchemaFactory.createForClass(Work);
