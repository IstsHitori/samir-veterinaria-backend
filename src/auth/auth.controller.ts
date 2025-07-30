import { Controller, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ParseTokenPipe } from 'src/common/pipes/parse-token/parse-token.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('confirm-email/:token')
  confirmAccount(@Param('token', ParseTokenPipe) token: string) {
    return this.authService.confirmAccount(token);
  }
}
