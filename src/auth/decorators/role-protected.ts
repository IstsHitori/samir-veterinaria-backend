import { SetMetadata } from '@nestjs/common';
import { META_ROLES, Role } from 'src/user/constants';

export const RoleProtected = (...args: Role[]) => {
  return SetMetadata(META_ROLES, args);
};
