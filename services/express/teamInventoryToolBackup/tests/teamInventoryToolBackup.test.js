const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../server');

chai.use(chaiHttp);

describe('team-inventory-tool-backup', () => {
  describe('/GET team-inventory-tool-backup', () => {
    describe('team-inventory-tool-backup/', () => {
      it('should try to get team inventory tool backup but see that there is none available', (done) => {
        chai.request(server).get('/team-inventory-tool-backup')
          .end((err, res) => {
            if (err) throw err;
            res.should.have.status(404);
            res.body.backups.should.have.length(0);
            res.body.backups.should.be.an('array');
            res.body.message.should.be.an('string');
            done();
          });
      });
    });
  });
});
