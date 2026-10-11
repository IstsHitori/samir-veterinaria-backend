import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategie';
import { USER_VALIDATION_MESSAGES } from 'src/user/constants';

const buildUserModel = (user: any) => ({
  findById: jest
    .fn()
    .mockReturnValue({ select: jest.fn().mockResolvedValue(user) }),
});

const makeConfig = (seed: string | undefined) => ({
  get: jest.fn().mockReturnValue(seed),
});

describe('JwtStrategy', () => {
  it('lanza Unauthorized si no está definido JWT_SEED', () => {
    expect(
      () => new JwtStrategy(buildUserModel(null) as any, makeConfig(undefined) as any),
    ).toThrow(UnauthorizedException);
  });

  it('retorna el usuario cuando existe, está activo y no eliminado', async () => {
    const user = { _id: '1', isActive: true, isDeleted: false };
    const strategy = new JwtStrategy(
      buildUserModel(user) as any,
      makeConfig('seed') as any,
    );

    await expect(strategy.validate({ id: '1' })).resolves.toBe(user);
  });

  it('lanza Unauthorized si el usuario no existe', async () => {
    const strategy = new JwtStrategy(
      buildUserModel(null) as any,
      makeConfig('seed') as any,
    );

    await expect(strategy.validate({ id: 'x' })).rejects.toThrow(
      USER_VALIDATION_MESSAGES.JWT_TOKEN_NOT_VALID,
    );
  });

  it('lanza Unauthorized si el usuario está inactivo', async () => {
    const strategy = new JwtStrategy(
      buildUserModel({ isActive: false, isDeleted: false }) as any,
      makeConfig('seed') as any,
    );

    await expect(strategy.validate({ id: 'x' })).rejects.toThrow(
      USER_VALIDATION_MESSAGES.USER_INACTIVE,
    );
  });

  it('lanza Unauthorized si el usuario está eliminado', async () => {
    const strategy = new JwtStrategy(
      buildUserModel({ isActive: true, isDeleted: true }) as any,
      makeConfig('seed') as any,
    );

    await expect(strategy.validate({ id: 'x' })).rejects.toThrow(
      USER_VALIDATION_MESSAGES.USER_NOT_FOUND,
    );
  });
});
