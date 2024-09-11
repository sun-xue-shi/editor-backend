import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true, unique: true })
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
