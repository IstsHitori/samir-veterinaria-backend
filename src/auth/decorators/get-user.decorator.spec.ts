import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GetUser } from './get-user.decorator';

const mockUser = { _id: '1', email: 'ana@test.com', firstName: 'Ana' };

@Controller('test')
class TestController {
  @Get()
  getPlain(@GetUser() user: any) {
    return { user };
  }

  @Get('field')
  getField(@GetUser('email') email: string) {
    return { email };
  }

  @Get('nouser')
  getNoUser(@GetUser() user: any) {
    return { user };
  }
}

describe('GetUser decorator', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      if (req.path !== '/test/nouser') req.user = mockUser;
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('retorna el usuario completo cuando no se pide un campo', async () => {
    const res = await request(app.getHttpServer()).get('/test');

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(mockUser);
  });

  it('retorna un campo específico cuando se indica', async () => {
    const res = await request(app.getHttpServer()).get('/test/field');

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('ana@test.com');
  });

  it('lanza error cuando no hay usuario en el request', async () => {
    const res = await request(app.getHttpServer()).get('/test/nouser');

    expect(res.status).toBe(500);
  });
});
