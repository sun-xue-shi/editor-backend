import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  phoneNumber: string;

  @Prop({ required: false })
  avatar: string;

  @Prop(Date)
  createTime: Date;

  @Prop(Date)
  updateTime: Date;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
