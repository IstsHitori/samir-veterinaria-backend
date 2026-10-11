import { corsOptions } from './cors.config';

describe('corsOptions', () => {
  it('habilita los métodos HTTP esperados', () => {
    expect(corsOptions.methods).toEqual(
      expect.arrayContaining(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
    );
  });

  it('permite los encabezados Content-Type y Authorization', () => {
    expect(corsOptions.allowedHeaders).toContain('Content-Type');
    expect(corsOptions.allowedHeaders).toContain('Authorization');
  });

  it('toma el origen desde FRONT_URL', () => {
    const original = process.env.FRONT_URL;
    process.env.FRONT_URL = 'http://front.test';

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fresh = require('./cors.config') as typeof import('./cors.config');
      expect(fresh.corsOptions.origin).toEqual(['http://front.test']);
    });

    process.env.FRONT_URL = original;
  });
});
