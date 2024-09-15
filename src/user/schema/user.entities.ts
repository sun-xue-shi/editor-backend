import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserType } from '../types';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      delete ret.password;
      delete ret.__v;
    },
  },
})
export class User {
  @Prop({ required: true, unique: true, type: String })
  id: number;

  @Prop({ required: true, unique: true, type: String })
  username: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: false, type: String })
  email: string;

  @Prop({ required: false, type: String })
  phoneNumber: string;

  @Prop({ required: false, type: String })
  avatar: string;

  @Prop({ required: true, type: Number })
  type: UserType;

  @Prop(Date)
  createTime: Date;

  @Prop(Date)
  updateTime: Date;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
