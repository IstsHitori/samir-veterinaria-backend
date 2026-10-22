import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../constants';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, type: String, enum: Object.values(Role) })
  role: Role;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Keep legacy MongoDB values untouched, but never expose the removed field in API JSON.
UserSchema.set('toJSON', {
  transform: (_document, result) => {
    delete (result as unknown as Record<string, unknown>).emailValidated;
    return result;
  },
});
