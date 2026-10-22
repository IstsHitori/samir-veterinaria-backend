import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { MailService } from 'src/mail/mail.service';
import { Role } from 'src/user/constants';
import { TOKEN_TYPE } from 'src/token/constants/token-type';

describe('Veterinaria API (e2e)', () => {
  let app: INestApplication;
  let http: any;
  let connection: Connection;
  let userModel: Model<any>;
  let tokenModel: Model<any>;

  const PASSWORD = 'Password123!';
  const NEW_PASS = 'NewPass1#';

  const userPayload = (overrides: Record<string, any> = {}) => ({
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'user@test.com',
    password: PASSWORD,
    role: Role.AUXILIARY,
    ...overrides,
  });

  const register = (payload: Record<string, any>) =>
    request(http).post('/api/auth/register').send(payload);

  const login = (email: string, password: string) =>
    request(http).post('/api/auth/login').send({ email, password });

  const loginAs = async (email: string, password: string): Promise<string> => {
    const res = await login(email, password).expect(200);
    return res.body.token;
  };

  const getToken = async (email: string, type: TOKEN_TYPE) => {
    const user = await userModel.findOne({ email }).exec();
    return tokenModel.findOne({ userId: String(user!._id), type }).exec();
  };

  beforeAll(async () => {
    process.env.PORT = '3001';
    process.env.MONGODB = 'mongodb://127.0.0.1:27017/veterinaria_e2e';
    process.env.JWT_SEED = 'e2e-seed';
    process.env.MAILER_SERVICE = 'gmail';
    process.env.MAILER_EMAIL = 'e2e@test.com';
    process.env.MAILER_SECRET_KEY = 'secret';
    process.env.WEBSERVICE_URL = 'http://localhost:3001';
    process.env.FRONT_URL = 'http://localhost:3000';

    // Import dinámico: AppModule lee process.env al importarse,
    // por eso debe hacerse DESPUÉS de setear las variables.
    const { AppModule } = await import('src/app.module');

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue({ sendEmail: jest.fn().mockResolvedValue(true) })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          exposeUnsetFields: false,
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    http = app.getHttpServer();
    connection = app.get(getConnectionToken());
    userModel = app.get(getModelToken('User'));
    tokenModel = app.get(getModelToken('Token'));
  });

  afterEach(async () => {
    await Promise.all(
      Object.values(connection.collections).map(c => c.deleteMany({})),
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await app.close();
  });

  describe('Registro', () => {
    it('registra un usuario y devuelve 201', async () => {
      const res = await register(userPayload({ email: 'nuevo@test.com' }));

      expect(res.status).toBe(201);
      expect(res.text).toBe('Se ha registrado la cuenta correctamente');
    });

    it('no crea un token de verificación al registrar', async () => {
      await register(
        userPayload({ email: 'sin-verificacion@test.com' }),
      ).expect(201);

      await expect(
        tokenModel.countDocuments({ type: 'confirmation' }),
      ).resolves.toBe(0);
    });

    it('rechaza un email duplicado con 400', async () => {
      await register(userPayload({ email: 'dup@test.com' })).expect(201);

      const res = await register(userPayload({ email: 'dup@test.com' }));

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Ya existe un usuario con este correo');
    });

    it('rechaza un segundo administrador con 400', async () => {
      await register(
        userPayload({ email: 'admin1@test.com', role: Role.ADMIN }),
      ).expect(201);

      const res = await register(
        userPayload({ email: 'admin2@test.com', role: Role.ADMIN }),
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'No puede haber otro usuario administrador',
      );
    });

    it('rechaza datos inválidos con 400 (ValidationPipe)', async () => {
      const res = await register(
        userPayload({ email: 'mal', password: 'debil' }),
      );

      expect(res.status).toBe(400);
    });

    it('rechaza propiedades no permitidas con 400 (forbidNonWhitelisted)', async () => {
      const res = await register(
        userPayload({ email: 'extra@test.com', hacker: true }),
      );

      expect(res.status).toBe(400);
    });
  });

  describe('Login', () => {
    it('retorna un token JWT con credenciales válidas', async () => {
      await register(userPayload({ email: 'login@test.com' })).expect(201);

      const res = await login('login@test.com', PASSWORD);

      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(10);
    });

    it('rechaza credenciales inválidas con 400', async () => {
      await register(userPayload({ email: 'login2@test.com' })).expect(201);

      const res = await login('login2@test.com', 'PasswordMal1!');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email o contraseña incorrectos');
    });

    it('rechaza un usuario inexistente con 404', async () => {
      const res = await login('noexiste@test.com', 'Algo123!');

      expect(res.status).toBe(404);
    });
  });

  describe('Endpoints protegidos', () => {
    it('rechaza sin token con 401', async () => {
      await request(http).get('/api/auth').expect(401);
    });

    it('retorna el perfil con token válido', async () => {
      await register(userPayload({ email: 'perfil@test.com' })).expect(201);
      const token = await loginAs('perfil@test.com', PASSWORD);

      const res = await request(http)
        .get('/api/auth')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.profile.email).toBe('perfil@test.com');
      expect(res.body.profile.password).toBeUndefined();
    });
  });

  describe('Confirmación de cuenta retirada', () => {
    it('ya no expone el endpoint de confirmación', async () => {
      await request(http).post('/api/auth/confirm-email/123').expect(404);
    });
  });

  describe('Recuperación de contraseña', () => {
    it('completa el flujo forgot -> validate -> update -> login', async () => {
      await register(userPayload({ email: 'reset@test.com' })).expect(201);

      await request(http)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@test.com' })
        .expect(200);

      const token = await getToken('reset@test.com', TOKEN_TYPE.PASSWORD_RESET);
      expect(token).toBeTruthy();

      await request(http)
        .post('/api/auth/validate-token')
        .send({ token: token!.value })
        .expect(200);

      await request(http)
        .post(`/api/auth/update-password/${token!.value}`)
        .send({ newPassword: NEW_PASS, confirmNewPassword: NEW_PASS })
        .expect(200);

      await login('reset@test.com', NEW_PASS).expect(200);
      await login('reset@test.com', PASSWORD).expect(400);
    });

    it('devuelve 404 si el email no existe en forgot-password', async () => {
      const res = await request(http)
        .post('/api/auth/forgot-password')
        .send({ email: 'noexiste@test.com' });

      expect(res.status).toBe(404);
    });
  });

  describe('Autorización por roles', () => {
    it('permite al admin listar usuarios y bloquea al auxiliar con 403', async () => {
      await register(
        userPayload({ email: 'admin@test.com', role: Role.ADMIN }),
      ).expect(201);
      await register(
        userPayload({ email: 'aux@test.com', role: Role.AUXILIARY }),
      ).expect(201);

      const adminToken = await loginAs('admin@test.com', PASSWORD);
      const auxToken = await loginAs('aux@test.com', PASSWORD);

      const adminRes = await request(http)
        .get('/api/user')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);
      expect(Array.isArray(adminRes.body.users)).toBe(true);

      const auxRes = await request(http)
        .get('/api/user')
        .set('Authorization', `Bearer ${auxToken}`);
      expect(auxRes.status).toBe(403);
    });
  });

  describe('CRUD de Dueños y Pacientes', () => {
    const ownerPayload = {
      name: 'Juan Perez',
      document: '1234567',
      address: 'Calle Falsa 123',
      email: 'juan@owner.com',
      telephone: '3001234567',
    };

    let adminToken: string;

    beforeEach(async () => {
      await register(
        userPayload({ email: 'admin.crud@test.com', role: Role.ADMIN }),
      ).expect(201);
      adminToken = await loginAs('admin.crud@test.com', PASSWORD);
    });

    const auth = () => ({ Authorization: `Bearer ${adminToken}` });

    it('crea un dueño, un paciente y los consulta', async () => {
      const ownerRes = await request(http)
        .post('/api/owner')
        .set(auth())
        .send(ownerPayload)
        .expect(201);
      expect(ownerRes.body.message).toBe('Dueño creado');

      const ownersRes = await request(http)
        .get('/api/owner')
        .set(auth())
        .expect(200);
      expect(ownersRes.body.owners).toHaveLength(1);

      const patientRes = await request(http)
        .post('/api/patient')
        .set(auth())
        .send({
          name: 'Firulais',
          type: 'perro',
          breed: 'Labrador',
          birthDate: '2020-01-01',
          gender: 'masculino',
          weight: '20',
          size: 'mediano',
          ownerId: ownerRes.body.ownerId,
        })
        .expect(201);
      expect(patientRes.text).toBe('Paciente registrado');

      const patientsRes = await request(http)
        .get('/api/patient')
        .set(auth())
        .expect(200);
      expect(patientsRes.body.patients).toHaveLength(1);
      expect(patientsRes.body.patients[0].name).toBe('Firulais');
    });

    it('rechaza crear un paciente con un dueño inexistente', async () => {
      const res = await request(http).post('/api/patient').set(auth()).send({
        name: 'Firulais',
        type: 'perro',
        breed: 'Labrador',
        birthDate: '2020-01-01',
        gender: 'masculino',
        weight: '20',
        size: 'mediano',
        ownerId: '507f191e810c19729de860ea',
      });

      expect(res.status).toBe(404);
    });

    it('rechaza un dueño con email duplicado', async () => {
      await request(http)
        .post('/api/owner')
        .set(auth())
        .send(ownerPayload)
        .expect(201);

      const res = await request(http)
        .post('/api/owner')
        .set(auth())
        .send(ownerPayload);

      expect(res.status).toBe(400);
    });
  });

  describe('Reportes médicos', () => {
    it('un veterinario crea un reporte y se agrupa por paciente', async () => {
      await register(
        userPayload({ email: 'admin.rep@test.com', role: Role.ADMIN }),
      ).expect(201);
      const adminToken = await loginAs('admin.rep@test.com', PASSWORD);

      const ownerRes = await request(http)
        .post('/api/owner')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Juan Perez',
          document: '1234567',
          address: 'Calle Falsa 123',
          email: 'juan@owner.com',
          telephone: '3001234567',
        })
        .expect(201);

      const patientRes = await request(http)
        .post('/api/patient')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Firulais',
          type: 'perro',
          breed: 'Labrador',
          birthDate: '2020-01-01',
          gender: 'masculino',
          weight: '20',
          size: 'mediano',
          ownerId: ownerRes.body.ownerId,
        });
      const patientId = (
        await request(http)
          .get('/api/patient')
          .set('Authorization', `Bearer ${adminToken}`)
      ).body.patients[0]._id;
      expect(patientRes.status).toBe(201);

      await register(
        userPayload({ email: 'vet@test.com', role: Role.VETERINARY }),
      ).expect(201);
      const vetToken = await loginAs('vet@test.com', PASSWORD);

      const reportRes = await request(http)
        .post('/api/medical-reports')
        .set('Authorization', `Bearer ${vetToken}`)
        .send({ patientId, details: 'Control anual' })
        .expect(201);
      expect(reportRes.text).toBe('Reporte médico creado');

      const listRes = await request(http)
        .get('/api/medical-reports')
        .set('Authorization', `Bearer ${vetToken}`)
        .expect(200);
      expect(listRes.body.reports).toHaveLength(1);
      expect(listRes.body.reports[0].reports[0].details).toBe('Control anual');
    });
  });
});
