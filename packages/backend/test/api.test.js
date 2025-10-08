import { chai } from './setup.js';
import { app, server } from '../src/index.js';

const { expect } = chai;

describe('endpoints', () => {
  after(() => {
    if (server) {
      server.close();
    }
  });

  describe('GET /health', () => {
    it('retorna estado de salud server', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 'OK');
          expect(res.body).to.have.property('timestamp');
          expect(res.body).to.have.property('uptime');
          expect(res.body).to.have.property('environment');
          done();
        });
    });
  });

  describe('GET /api', () => {
    it('retorna información de la api', (done) => {
      chai.request(app)
        .get('/api')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('version', '1.0.0');
          expect(res.body).to.have.property('endpoints');
          done();
        });
    });
  });

  describe('404 Handler', () => {
    it('retorna 404 para rutas que no existen', (done) => {
      chai.request(app)
        .get('/no-existe')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('error', 'route not found');
          expect(res.body).to.have.property('path', '/no-existe');
          done();
        });
    });
  });
});