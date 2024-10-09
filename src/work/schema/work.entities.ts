import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ChannelsType, StatusType } from '../types';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      delete ret.__v;
    },
  },
})
export class Work {
  @Prop({ required: true, unique: true, type: Number })
  id: number;

  @Prop({ required: true, unique: true, type: String })
  uuid: string;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: false, type: String })
  desc: string;

  @Prop({ required: false, type: String })
  coverImg: string;

  @Prop({ required: true, type: Object })
  content?: Record<string, any>;

  @Prop({ required: false, type: Boolean })
  isTemplate?: boolean;

  @Prop({ required: false, type: Boolean })
  isPublish?: boolean;

  @Prop({ required: false, type: Boolean })
  isHot?: boolean;

  @Prop({ required: true, type: String })
  author: string;

  @Prop({ required: true, type: Number })
  copiedCount: number;

  @Prop({ required: false, type: Number })
  status: StatusType;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop(Date)
  latestPublishAt: Date;

  @Prop(Date)
  createTime: Date;

  @Prop(Date)
  updateTime: Date;

  @Prop({ required: false, type: Array<object> })
  channels: ChannelsType[];
}

export type WorkDocument = HydratedDocument<Work>;

export const WorkSchema = SchemaFactory.createForClass(Work);
