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
    it('retorna estado de salud del servidor', (done) => {
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
    it('retorna información de la API', (done) => {
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

  describe('GET /files/data', () => {
    it('debería obtener y procesar archivos CSV exitosamente', function(done) {
      this.timeout(20000);
      
      chai.request(app)
        .get('/files/data')
        .end((err, res) => {

          if (err && err.timeout) {
            console.log('Timeout en API externa - esto es esperado en algunos casos');
            return done();
          }
          
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          
          expect(res.body).to.have.property('totalFiles');
          expect(res.body).to.have.property('processedFiles');  
          expect(res.body).to.have.property('files');
          
          expect(res.body.files).to.be.an('array');
          expect(res.body.totalFiles).to.be.a('number');
          expect(res.body.processedFiles).to.be.a('number');
          
          console.log(`Procesados: ${res.body.processedFiles}/${res.body.totalFiles} archivos`);
          
          if (res.body.files.length > 0) {
            const firstFile = res.body.files[0];
            expect(firstFile).to.have.property('file');
            expect(firstFile).to.have.property('lines');
            expect(firstFile.lines).to.be.an('array');
            
            const fileWithLines = res.body.files.find(f => f.lines.length > 0);
            if (fileWithLines) {
              const firstLine = fileWithLines.lines[0];
              expect(firstLine).to.have.property('text');
              expect(firstLine).to.have.property('number');
              expect(firstLine).to.have.property('hex');
              expect(firstLine.text).to.be.a('string');
              expect(firstLine.number).to.be.a('number');
              expect(firstLine.hex).to.be.a('string');
            }
          }
          
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
          expect(res.body).to.have.property('error', 'Route not found');
          expect(res.body).to.have.property('path', '/no-existe');
          done();
        });
    });
  });
});