import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from './entities/token.entity';
import { Model } from 'mongoose';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
  ) {}

  async findOneByToken(token: string) {
    const foundToken = await this.tokenModel.findOne({ value: token });
    return foundToken;
  }
}
