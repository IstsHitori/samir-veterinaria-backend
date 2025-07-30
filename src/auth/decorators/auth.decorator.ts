import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from 'src/user/constants';
import { RoleProtected } from './role-protected';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
