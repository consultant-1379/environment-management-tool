const request = require('supertest');
const express = require('express');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const server = require('../../server');

chai.use(chaiHttp);

const defaultState = 'QUARANTINE';
const testDeployment = {
  name: 'ieatenmcTest',
  deploymentType: 'FUNCTIONAL',
  platformType: 'vENM',
  username: 'expressTests',
};
const testDeploymentWithoutUsername = {
  name: 'ieatenmcTest',
  deploymentType: 'FUNCTIONAL',
  platformType: 'vENM',
};
const testDeploymentWithInvalidState = {
  state: 'QUARANTIN E',
  username: 'expressTests',
};
let testDeploymentId;

describe('deployments', () => {
  describe('GET REQUEST', () => {
    describe('deployments/', () => {
      it('should get all deployments', (done) => {
        chai.request(server).get('/deployments')
          .end((err, res) => {
            if (err) throw err;
            res.body.should.be.an('array');
            res.body.should.have.length(0);
            res.should.have.status(200);
            done();
          });
      });
    });

    describe('deployments/search', () => {
      const deploymentIds = [];
      let idleDeploymentId;
      let idleDeployment2Id;
      let quarantineDeploymentId;
      let quarantineDeployment2Id;
      const idleDeployment = {
        name: 'ieatenmcTest1',
        state: 'IDLE',
        platformType: 'vENM',
        deploymentType: 'NON-FUNCTIONAL',
        testPhase: 'MTE',
        nssProductSetVersion: '19.12.15',
        username: 'expressTests',
      };
      const idleDeployment2 = {
        name: 'test420',
        state: 'IDLE',
        platformType: 'Physical',
        deploymentType: 'FUNCTIONAL',
        testPhase: 'CDL',
        username: 'expressTests',
      };
      const quarantineDeployment = {
        name: 'ieatenmcTest0',
        state: 'QUARANTINE',
        platformType: 'vENM',
        deploymentType: 'FUNCTIONAL',
        testPhase: 'MTE',
        workloadVm: 'test420wlvm',
        username: 'expressTests',
      };
      const quarantineDeployment2 = {
        name: 'test341',
        state: 'QUARANTINE',
        platformType: 'Physical',
        deploymentType: 'NON-FUNCTIONAL',
        testPhase: 'PLM',
        username: 'expressTests',
      };
      before(async () => {
        let response = await chai.request(server).post('/deployments').send({
          name: 'ieatenmcTest0',
          username: 'expressTests',
        });
        quarantineDeploymentId = response.body._id;
        deploymentIds.push(quarantineDeploymentId);
        await chai.request(server).put(`/deployments/${response.body._id}`).send(quarantineDeployment);

        response = await chai.request(server).post('/deployments').send({
          name: 'test341',
          username: 'expressTests',
        });
        quarantineDeployment2Id = response.body._id;
        deploymentIds.push(response.body._id);
        await chai.request(server).put(`/deployments/${response.body._id}`).send(quarantineDeployment2);

        response = await chai.request(server).post('/deployments').send({
          name: 'ieatenmcTest1',
          username: 'expressTests',
        });
        idleDeploymentId = response.body._id;
        deploymentIds.push(response.body._id);
        await chai.request(server).put(`/deployments/${response.body._id}`).send(idleDeployment);

        response = await chai.request(server).post('/deployments').send({
          name: 'test420',
          username: 'expressTests',
        });
        idleDeployment2Id = response.body._id;
        deploymentIds.push(response.body._id);
        await chai.request(server).put(`/deployments/${response.body._id}`).send(idleDeployment2);
      });

      after(async () => {
        for (const deployment in deploymentIds) {
          // Might be good to leave this comment here for people wondering why
          // I done this https://eslint.org/docs/rules/guard-for-in
          if (Object.prototype.hasOwnProperty.call(deploymentIds, deployment)) {
            const deploymentId = deploymentIds[deployment];
            await chai.request(server).delete(`/deployments/${deploymentId}?username=expressTests`);
          }
        }
      });

      it('should get a collections of deployments matching the search criteria with one query param', (done) => {
        chai.request(server).get('/deployments/search?q=state=IDLE')
          .end((err, res) => {
            res.body.should.be.an('array');
            res.should.have.status(200);
            res.body.should.have.length(2);
            res.body[0].should.have.property('_id').to.deep.equal(idleDeploymentId);
            res.body[0].should.have.property('name').to.deep.equal(idleDeployment.name);
            res.body[0].should.have.property('state').to.deep.equal(idleDeployment.state);
            res.body[0].should.have.property('nssProductSetVersion').to.deep.equal(idleDeployment.nssProductSetVersion);
            done();
          });
      });

      it('should get a collections of deployments matching the search criteria with two queries', (done) => {
        chai.request(server).get('/deployments/search?q=state=IDLE&q=testPhase=MTE')
          .end((err, res) => {
            res.body.should.be.an('array');
            res.should.have.status(200);
            res.body[0].should.have.property('_id').to.deep.equal(idleDeploymentId);
            res.body[0].should.have.property('name').to.deep.equal(idleDeployment.name);
            res.body[0].should.have.property('state').to.deep.equal(idleDeployment.state);
            res.body[0].should.have.property('testPhase').to.deep.equal(idleDeployment.testPhase);
            res.body[0].should.have.property('nssProductSetVersion').to.deep.equal(idleDeployment.nssProductSetVersion);
            res.body.should.have.length(1);
            done();
          });
      });

      it('should get a collections of deployments matching the search criteria with two test phase query params', (done) => {
        chai.request(server).get('/deployments/search?q=testPhase=MTE%PLM')
          .end((err, res) => {
            res.body.should.be.an('array');
            res.should.have.status(200);
            res.body.should.have.length(3);

            res.body[0].should.have.property('_id').to.deep.equal(quarantineDeploymentId);
            res.body[0].should.have.property('name').to.deep.equal(quarantineDeployment.name);
            res.body[0].should.have.property('state').to.deep.equal(quarantineDeployment.state);
            res.body[0].should.have.property('workloadVm').to.deep.equal(quarantineDeployment.workloadVm);

            res.body[1].should.have.property('_id').to.deep.equal(quarantineDeployment2Id);
            res.body[1].should.have.property('name').to.deep.equal(quarantineDeployment2.name);
            res.body[1].should.have.property('state').to.deep.equal(quarantineDeployment2.state);

            res.body[2].should.have.property('_id').to.deep.equal(idleDeploymentId);
            res.body[2].should.have.property('name').to.deep.equal(idleDeployment.name);
            res.body[2].should.have.property('state').to.deep.equal(idleDeployment.state);
            res.body[2].should.have.property('nssProductSetVersion').to.deep.equal(idleDeployment.nssProductSetVersion);
            done();
          });
      });

      it('should get a collections of deployments matching the search criteria with two state query params', (done) => {
        chai.request(server).get('/deployments/search?q=state=IDLE&q=state=QUARANTINE')
          .end((err, res) => {
            res.body.should.be.an('array');
            res.should.have.status(200);
            res.body.should.have.length(4);
            done();
          });
      });

      it('should get a collections of deployments matching the search criteria with three query params', (done) => {
        chai.request(server).get('/deployments/search?q=testPhase=MTE%PLM&q=state=QUARANTINE')
          .end((err, res) => {
            res.body.should.be.an('array');
            res.should.have.status(200);
            res.body.should.have.length(2);
            res.body[0].should.have.property('_id').to.deep.equal(quarantineDeploymentId);
            res.body[0].should.have.property('name').to.deep.equal(quarantineDeployment.name);
            res.body[0].should.have.property('state').to.deep.equal(quarantineDeployment.state);
            res.body[0].should.have.property('workloadVm').to.deep.equal(quarantineDeployment.workloadVm);

            res.body[1].should.have.property('_id').to.deep.equal(quarantineDeployment2Id);
            res.body[1].should.have.property('name').to.deep.equal(quarantineDeployment2.name);
            res.body[1].should.have.property('state').to.deep.equal(quarantineDeployment2.state);
            done();
          });
      });

      it('should get a collections of deployments matching the search criteria with four query params', (done) => {
        chai.request(server).get('/deployments/search?q=testPhase=MTE%PLM&q=state=QUARANTINE&q=deploymentType=FUNCTIONAL')
          .end((err, res) => {
            res.body.should.be.an('array');
            res.should.have.status(200);
            res.body.should.have.length(1);
            res.body[0].should.have.property('_id').to.deep.equal(quarantineDeploymentId);
            res.body[0].should.have.property('name').to.deep.equal(quarantineDeployment.name);
            res.body[0].should.have.property('state').to.deep.equal(quarantineDeployment.state);
            res.body[0].should.have.property('workloadVm').to.deep.equal(quarantineDeployment.workloadVm);
            done();
          });
      });

      it('should return deployments matching the search criteria limiting the array items to the values in the fields param fields', (done) => {
        chai.request(server).get('/deployments/search?q=state=IDLE&q=testPhase=MTE&fields=_id')
          .end((err, res) => {
            res.body.should.be.an('array');
            res.should.have.status(200);
            res.body[0].should.have.property('_id').to.deep.equal(idleDeploymentId);
            res.body[0].should.not.have.property('name').to.deep.equal(idleDeployment.name);
            res.body[0].should.not.have.property('state');
            done();
          });
      });
    });
  });

  it('should get zero collections of deployments as the search criteria should match no deployment', (done) => {
    chai.request(server).get('/deployments/search?q=testPhase=DROPBACK')
      .end((err, res) => {
        res.body.should.be.an('array');
        res.should.have.status(200);
        res.body.should.have.length(0);
        done();
      });
  });

  describe('/POST deployments', () => {
    afterEach(async () => {
      await chai.request(server).delete(`/deployments/${testDeploymentId}?username=expressTests`);
    });

    it('should create a new deployment with default values', (done) => {
      chai.request(server).post('/deployments')
        .send(testDeployment)
        .end((err, res) => {
          res.body.should.be.an('object');
          res.should.have.status(201);
          res.body.should.have.property('_id');
          testDeploymentId = res.body._id;
          res.body.should.have.property('name').to.deep.equal(testDeployment.name);
          res.body.should.have.property('state').to.deep.equal(defaultState);
          res.body.should.have.property('deploymentType').to.deep.equal(testDeployment.deploymentType);
          res.body.should.have.property('platformType').to.deep.equal(testDeployment.platformType);
          done();
        });
    });

    it('should create a new deployment with defined values', (done) => {
      testDeployment.testPhase = 'PLM';

      chai.request(server).post('/deployments')
        .send(testDeployment)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.should.have.property('_id');
          testDeploymentId = res.body._id;
          res.body.should.have.property('name').to.deep.equal(testDeployment.name);
          res.body.should.have.property('testPhase').to.deep.equal(testDeployment.testPhase);
          res.body.should.have.property('state').to.deep.equal(defaultState);
          done();
        });
    });
  });

  describe('/POST deployments', () => {
    it('should not create a deployment', (done) => {
      chai.request(server).post('/deployments')
        .send(testDeploymentWithoutUsername)
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
  });

  describe('/PUT deployments', () => {
    let putDeploymentId;
    beforeEach(async () => {
      const response = await chai.request(server).post('/deployments')
        .send(testDeployment);
      putDeploymentId = response.body._id;
    });

    afterEach(async () => {
      await chai.request(server).delete(`/deployments/${putDeploymentId}?username=expressTests`);
    });

    it('should set a state to IDLE', (done) => {
      chai.request(server).put(`/deployments/${putDeploymentId}`)
        .send({
          state: 'IDLE',
          username: 'expressTests',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('_id').to.deep.equal(putDeploymentId);
          res.body.should.have.property('state').to.deep.equal('IDLE');
          done();
        });
    });

    it('should not update the state as state is invalid', (done) => {
      chai.request(server).put(`/deployments/${putDeploymentId}`)
        .send(testDeploymentWithInvalidState)
        .end((err, res) => {
          res.should.have.status(412);
          res.body.should.have.property('message').to.deep.equal('State must be either IDLE,BUSY,QUARANTINE. Received QUARANTIN E');
          done();
        });
    });

    it('should assign a job to the deployment and set the test phase', (done) => {
      const assignedJob = 'vENM_Upgrade';
      const testPhase = 'MTE';
      const username = 'expressTests';
      chai.request(server).put(`/deployments/${putDeploymentId}`)
        .send({ assignedJob, testPhase, username })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('_id').to.deep.equal(putDeploymentId);
          res.body.should.have.property('assignedJob').to.deep.equal(assignedJob);
          res.body.should.have.property('testPhase').to.deep.equal(testPhase);
          done();
        });
    });
    it('should update the deployment information', (done) => {
      const productSet = '1.2.3';
      const deploymentType = 'FUNCTIONAL';
      const shcStatus = 'REQUIRED';
      const refreshStatus = 'COMPLETED';
      const rollbackStatus = 'COMPLETED';
      const upgradeStatus = 'COMPLETED';
      const username = 'expressTests';

      chai.request(server).put(`/deployments/${putDeploymentId}`)
        .send({
          productSet,
          deploymentType,
          deploymentRefreshStatus: refreshStatus,
          systemHealthCheckStatus: shcStatus,
          deploymentRollbackStatus: rollbackStatus,
          deploymentUpgradeStatus: upgradeStatus,
          username: 'expressTests',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('_id').to.deep.equal(putDeploymentId);
          res.body.should.have.property('productSet').to.deep.equal(productSet);
          res.body.should.have.property('deploymentType').to.deep.equal(deploymentType);
          res.body.should.have.property('deploymentRefreshStatus').to.deep.equal(refreshStatus);
          res.body.should.have.property('systemHealthCheckStatus').to.deep.equal(shcStatus);
          res.body.should.have.property('deploymentRollbackStatus').to.deep.equal(rollbackStatus);
          res.body.should.have.property('deploymentUpgradeStatus').to.deep.equal(upgradeStatus);
          done();
        });
    });
    it('should update the deployment information', (done) => {
      const nssProductSetVersion = '18.18.1';
      const nrmVersion = 'NRM4.1';
      const nrmSize = '5K';
      const username = 'expressTests';

      chai.request(server).put(`/deployments/${putDeploymentId}`)
        .send({
          nssProductSetVersion, nrmVersion, nrmSize, username,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('_id').to.deep.equal(putDeploymentId);
          res.body.should.have.property('nssProductSetVersion').to.deep.equal(nssProductSetVersion);
          res.body.should.have.property('nrmVersion').to.deep.equal(nrmVersion);
          res.body.should.have.property('nrmSize').to.deep.equal(nrmSize);
          done();
        });
    });
  });

  describe('/PUT deployments', () => {
    let putDeploymentId;
    beforeEach(async () => {
      const response = await chai.request(server).post('/deployments')
        .send(testDeployment);
      putDeploymentId = response.body._id;
    });

    afterEach(async () => {
      await chai.request(server).delete(`/deployments/${putDeploymentId}?username=expressTests`);
    });

    it('should not set a state to IDLE', (done) => {
      chai.request(server).put(`/deployments/${putDeploymentId}`)
        .send({
          state: 'IDLE',
        })
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
  });

  describe('/DELETE delete a deployment', () => {
    let deploymentToDeleteId;
    before(async () => {
      const response = await chai.request(server).post('/deployments').send(testDeployment);
      deploymentToDeleteId = response.body._id;
    });

    it('should delete the deployment with corresponding id', async () => {
      await chai.request(server).delete(`/deployments/${deploymentToDeleteId}?username='expressTests',`);
    });
  });

  describe('/DELETE delete a deployment', () => {
    let deploymentToDeleteId;
    before(async () => {
      const response = await chai.request(server).post('/deployments').send(testDeployment);
      deploymentToDeleteId = response.body._id;
    });
    it('should not delete the deployment with corresponding id', (done) => {
      chai.request(server).delete(`/deployments/${deploymentToDeleteId},`)
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
    after(async () => {
      await chai.request(server).delete(`/deployments/${deploymentToDeleteId}?username=expressTests`);
    });
  });
});
