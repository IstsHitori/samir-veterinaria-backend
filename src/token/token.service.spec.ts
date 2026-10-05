import { TokenService } from './token.service';

describe('TokenService', () => {
  let tokenModel: { findOne: jest.Mock };
  let service: TokenService;

  beforeEach(() => {
    tokenModel = { findOne: jest.fn() };
    service = new TokenService(tokenModel as any);
  });

  describe('findOneByToken', () => {
    it('busca el token por su valor', async () => {
      const token = { value: '123456' };
      tokenModel.findOne.mockResolvedValue(token);

      await expect(service.findOneByToken('123456')).resolves.toBe(token);
      expect(tokenModel.findOne).toHaveBeenCalledWith({ value: '123456' });
    });

    it('retorna null cuando el token no existe', async () => {
      tokenModel.findOne.mockResolvedValue(null);

      await expect(service.findOneByToken('000000')).resolves.toBeNull();
    });
  });
});
