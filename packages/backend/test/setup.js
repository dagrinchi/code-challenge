import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);

process.env.NODE_ENV = 'test';
process.env.PORT = '0';

before(() => {
  console.log('Starting test suite...');
});

after(() => {
  console.log('Test suite completed.');
});

export { chai };