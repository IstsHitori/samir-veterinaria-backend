import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ParseTokenPipe } from 'src/common/pipes/parse-token/parse-token.pipe';
import { CreateUserDto, LoginUserDto } from 'src/user/dto';
import { ForgotPasswordDto, ValidateTokenDto, UpdatePasswordDto } from './dto';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Auth()
  getUserProfile(@GetUser() user: User) {
    return { profile: user };
  }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('confirm-email/:token')
  confirmAccount(@Param('token', ParseTokenPipe) token: string) {
    return this.authService.confirmAccount(token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('validate-token')
  validateToken(@Body() validateTokenDto: ValidateTokenDto) {
    return this.authService.validateToken(validateTokenDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('update-password/:token')
  updatePassword(
    @Param('token', ParseTokenPipe) token: string,
    @Body()
    updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(updatePasswordDto, token);
  }
}
