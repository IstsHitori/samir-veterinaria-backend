import 'reflect-metadata';
import { RoleProtected } from './role-protected';
import { META_ROLES, Role } from 'src/user/constants';

describe('RoleProtected', () => {
  it('guarda los roles indicados en la metadata', () => {
    class Dummy {}

    RoleProtected(Role.ADMIN, Role.AUXILIARY)(Dummy);

    expect(Reflect.getMetadata(META_ROLES, Dummy)).toEqual([
      Role.ADMIN,
      Role.AUXILIARY,
    ]);
  });

  it('guarda un arreglo vacío cuando no se indican roles', () => {
    class Dummy {}

    RoleProtected()(Dummy);

    expect(Reflect.getMetadata(META_ROLES, Dummy)).toEqual([]);
  });
});
