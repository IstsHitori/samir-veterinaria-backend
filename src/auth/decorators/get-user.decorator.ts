import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

//TODO:Modificar si se necesitan otros campos a estos
type ValidData = 'email' | 'firstName' | '_id';

export const GetUser = createParamDecorator(
  (data: ValidData, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ user: User }>();
    const user = req.user;
    if (data && user) {
      return user[data];
    }

    if (!user)
      throw new InternalServerErrorException('User not found (request)');

    return user;
  },
);
