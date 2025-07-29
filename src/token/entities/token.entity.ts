import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TokenType } from '../constants/token-type';
@Schema({ timestamps: true })
export class Token extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  value: string;

  @Prop({
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
  })
  expiresAt: Date;

  @Prop({ required: true, type: String, enum: Object.values(TokenType) })
  type: TokenType;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
