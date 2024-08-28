const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');

chai.use(chaiHttp);

const oldestValidCloudEnvironment = {
  name: 'ieatenmc7a12',
  platformType: 'vENM',
  productSet: '19.12.12',
  testPhase: 'MTE',
  systemHealthCheckStatus: 'COMPLETED',
  state: 'IDLE',
  username: 'expressTests',
};
const latestValidCloudEnvironment = {
  name: 'ieatenmc7a13',
  platformType: 'vENM',
  productSet: '19.12.13',
  testPhase: 'MTE',
  systemHealthCheckStatus: 'COMPLETED',
  state: 'IDLE',
  username: 'expressTests',
};
const latestCloudEnvironmentSHCRequired = {
  name: 'ieatenmc7a14',
  platformType: 'vENM',
  productSet: '19.12.14',
  testPhase: 'MTE',
  systemHealthCheckStatus: 'REQUIRED',
  state: 'IDLE',
  username: 'expressTests',
};
const latestCloudEnvironmentQuarantine = {
  name: 'ieatenmc7a15',
  platformType: 'vENM',
  productSet: '19.12.15',
  testPhase: 'MTE',
  systemHealthCheckStatus: 'COMPLETED',
  state: 'QUARANTINE',
  username: 'expressTests',
};
const latestCloudEnvironmentRVB = {
  name: 'ieatenmc7a16',
  platformType: 'vENM',
  productSet: '19.12.16',
  testPhase: 'RVB',
  systemHealthCheckStatus: 'COMPLETED',
  state: 'IDLE',
  username: 'expressTests',
};
const oldestValidPhysicalEnvironment = {
  name: '306',
  platformType: 'physical',
  productSet: '19.12.12',
  testPhase: 'MTE',
  systemHealthCheckStatus: 'COMPLETED',
  state: 'IDLE',
  username: 'expressTests',
};
const newestValidPhysicalEnvironment = {
  name: '307',
  platformType: 'physical',
  productSet: '19.12.13',
  testPhase: 'MTE',
  systemHealthCheckStatus: 'COMPLETED',
  state: 'IDLE',
  username: 'expressTests',
};

describe('amtel', () => {
  describe('SEARCH REQUEST', () => {
    describe('amtel/', () => {
      const deploymentIds = [];

      before(async () => {
        const oldestValidCloudEnvironmentSend = await chai.request(server).post('/deployments/').send({
          name: ' ',
          username: 'expressTests',
        });
        let deploymentId = oldestValidCloudEnvironmentSend.body._id;
        deploymentIds.push(deploymentId);
        await chai.request(server).put(`/deployments/${deploymentId}/`).send(oldestValidCloudEnvironment);

        const latestValidCloudEnvironmentSend = await chai.request(server).post('/deployments/').send({
          name: ' ',
          username: 'expressTests',
        });
        deploymentId = latestValidCloudEnvironmentSend.body._id;
        deploymentIds.push(deploymentId);
        await chai.request(server).put(`/deployments/${deploymentId}/`).send(latestValidCloudEnvironment);

        const latestCloudEnvironmentSHCRequiredSend = await chai.request(server).post('/deployments/').send({
          name: ' ',
          username: 'expressTests',
        });
        deploymentId = latestCloudEnvironmentSHCRequiredSend.body._id;
        deploymentIds.push(deploymentId);
        await chai.request(server).put(`/deployments/${deploymentId}/`).send(latestCloudEnvironmentSHCRequired);

        const latestCloudEnvironmentQuarantineSend = await chai.request(server).post('/deployments/').send({
          name: ' ',
          username: 'expressTests',
        });
        deploymentId = latestCloudEnvironmentQuarantineSend.body._id;
        deploymentIds.push(deploymentId);
        await chai.request(server).put(`/deployments/${deploymentId}/`).send(latestCloudEnvironmentQuarantine);

        const latestCloudEnvironmentRVBSend = await chai.request(server).post('/deployments/').send({
          name: ' ',
          username: 'expressTests',
        });
        deploymentId = latestCloudEnvironmentRVBSend.body._id;
        deploymentIds.push(deploymentId);
        await chai.request(server).put(`/deployments/${deploymentId}/`).send(latestCloudEnvironmentRVB);

        const oldestValidPhysicalEnvironmentSend = await chai.request(server).post('/deployments/').send({
          name: ' ',
          username: 'expressTests',
        });
        deploymentId = oldestValidPhysicalEnvironmentSend.body._id;
        deploymentIds.push(deploymentId);
        await chai.request(server).put(`/deployments/${deploymentId}/`).send(oldestValidPhysicalEnvironment);

        const newestValidPhysicalEnvironmentSend = await chai.request(server).post('/deployments/').send({
          name: ' ',
          username: 'expressTests',
        });
        deploymentId = newestValidPhysicalEnvironmentSend.body._id;
        deploymentIds.push(deploymentId);
        await chai.request(server).put(`/deployments/${deploymentId}/`).send(newestValidPhysicalEnvironment);
      });

      it('should get latest cloud environment', (done) => {
        chai.request(server).get('/amtel/search?testPhase=MTE&platformType=vENM&versioningOrder=latest').end((err, res) => {
          if (err) throw err;
          res.body.should.be.an('object');
          res.body.should.have.property('environment').to.deep.equal('ieatenmc7a13');
          res.body.should.have.property('productSet').to.deep.equal('19.12.13');
          done();
        });
      });

      it('should get oldest cloud environment', (done) => {
        chai.request(server).get('/amtel/search?testPhase=MTE&platformType=vENM&versioningOrder=oldest').end((err, res) => {
          if (err) throw err;
          res.body.should.be.an('object');
          res.body.should.have.property('environment').to.deep.equal('ieatenmc7a12');
          res.body.should.have.property('productSet').to.deep.equal('19.12.12');
          done();
        });
      });

      it('should get latest physical environment', (done) => {
        chai.request(server).get('/amtel/search?testPhase=MTE&platformType=physical&versioningOrder=latest').end((err, res) => {
          if (err) throw err;
          res.body.should.be.an('object');
          res.body.should.have.property('environment').to.deep.equal('307');
          res.body.should.have.property('productSet').to.deep.equal('19.12.13');
          done();
        });
      });

      it('should get oldest physical environment', (done) => {
        chai.request(server).get('/amtel/search?testPhase=MTE&platformType=physical&versioningOrder=oldest').end((err, res) => {
          if (err) throw err;
          res.body.should.be.an('object');
          res.body.should.have.property('environment').to.deep.equal('306');
          res.body.should.have.property('productSet').to.deep.equal('19.12.12');
          done();
        });
      });

      it('should not get latest cloud environment if candidate is in QUARANTINE', (done) => {
        chai.request(server).get('/amtel/search?testPhase=MTE&platformType=vENM&versioningOrder=latest').end((err, res) => {
          if (err) throw err;
          res.body.should.be.an('object');
          res.body.should.have.property('environment').to.not.deep.equal('ieatenmc7a15');
          res.body.should.have.property('productSet').to.not.deep.equal('19.12.15');
          done();
        });
      });

      it('should not get latest cloud environment if candidate has SHC marked as REQUIRED', (done) => {
        chai.request(server).get('/amtel/search?testPhase=MTE&platformType=vENM&versioningOrder=latest').end((err, res) => {
          if (err) throw err;
          res.body.should.be.an('object');
          res.body.should.have.property('environment').to.not.deep.equal('ieatenmc7a14');
          res.body.should.have.property('productSet').to.not.deep.equal('19.12.14');
          done();
        });
      });

      it('should not get latest cloud environment if candidate is not an MTE environment', (done) => {
        chai.request(server).get('/amtel/search?testPhase=MTE&platformType=vENM&versioningOrder=latest').end((err, res) => {
          if (err) throw err;
          res.body.should.be.an('object');
          res.body.should.have.property('environment').to.not.deep.equal('ieatenmc7a16');
          res.body.should.have.property('productSet').to.not.deep.equal('19.12.16');
          done();
        });
      });

      it('should fail if versioningOrder is passed in incorrectly', (done) => {
        chai.request(server).get('/amtel/search?testPhase=MTE&platformType=vENM&versioningOrder=thisShouldFail').end((err, res) => {
          if (err) throw err;
          res.body.should.equal('thisShouldFail is not a correct versioning order. Plese see API docs');
          res.should.have.status(400);
          done();
        });
      });

      after(async () => {
        deploymentIds.forEach(async (deploymentId) => {
          await chai.request(server).delete(`/deployments/${deploymentId}?username='expressTests'`);
        });
      });
    });
  });
});
