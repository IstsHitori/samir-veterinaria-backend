/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { TOKEN_MESSAGES } from 'src/common/constants/token-messages';

@Injectable()
export class ParseTokenPipe implements PipeTransform {
  transform(value: string, { metatype }: ArgumentMetadata) {
    if (!value) throw new BadRequestException(TOKEN_MESSAGES.TOKEN_REQUIRED);
    if (value.length < 6 || value.length > 6)
      throw new BadRequestException(TOKEN_MESSAGES.TOKEN_LENGTH);

    return value;
  }
}
