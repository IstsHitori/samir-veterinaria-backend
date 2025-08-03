import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Owner {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  document: string;

  @Prop({
    type: String,
    required: true,
  })
  address: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  telephone: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({
    default: null,
  })
  deletedAt: Date;
}

export const OwnerSchema = SchemaFactory.createForClass(Owner);
