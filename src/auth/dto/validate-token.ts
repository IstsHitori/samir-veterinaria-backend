import { IsString, Length, IsNotEmpty } from 'class-validator';
import { TOKEN_MESSAGES } from 'src/common/constants/token-messages';

export class ValidateTokenDto {
  @IsString({ message: TOKEN_MESSAGES.TOKEN_STRING })
  @Length(6, 6, { message: TOKEN_MESSAGES.TOKEN_LENGTH })
  @IsNotEmpty({ message: TOKEN_MESSAGES.TOKEN_REQUIRED })
  token: string;
}
