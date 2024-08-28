const request = require('supertest');
const express = require('express');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const server = require('../../server');

chai.use(chaiHttp);

const defaultStatus = 'created';

const testSession = {
  assignedTeam: ['Bumblebee', 'ENM'],
  deploymentName: '123',
  deploymentId: '5afda28b197a00000f7eead7',
  days: 2,
  hours: 2,
  minutes: 2,
  timePeriodId: '123',
  jira: ['RTD-4749'],
  username: 'expressTests',
};

const testSessionWithoutUsername = {
  assignedTeam: ['Bumblebee', 'ENM'],
  deploymentName: '456',
  deploymentId: '5afda28b197a00000f7eead7',
  days: 2,
  hours: 2,
  minutes: 2,
  timePeriodId: '123',
  jira: ['RTD-4749'],
};

const testSessionForUpdate = {
  status: 'active',
  timePeriodId: '5afda28b197a00000f7eead7',
  startTime: '2018-07-16T13:02:25.967Z',
  endTime: '2018-07-16T13:03:25.967Z',
  jira: ['RTD-4749', 'RTD-4747'],
  username: 'expressTests',
};

const testSessionForUpdateWithoutUsername = {
  status: 'active',
  timePeriodId: '5afda28b197a00000f7eead7',
  startTime: '2018-07-16T13:02:25.967Z',
  endTime: '2018-07-16T13:03:25.967Z',
  jira: ['RTD-4749', 'RTD-4747'],
};

let sessionId;

describe('sessions', () => {
  describe('GET REQUEST', () => {
    describe('sessions/', () => {
      it('should get all sessions', (done) => {
        chai.request(server).get('/sessions')
          .end((err, res) => {
            if (err) throw err;
            res.should.have.status(200);
            res.body.should.have.length(0);
            res.body.should.be.an('array');
            done();
          });
      });
    });

    describe('sessions/search', () => {
      const timePeriod = {
        timePeriodId: '123abc',
        username: 'expressTests',
      };
      let testSessionId;

      before(async () => {
        const response = await chai.request(server).post('/sessions').send(testSession);
        testSessionId = response.body._id;
        await chai.request(server).put(`/sessions/${testSessionId}`).send(timePeriod);
      });

      after(async () => {
        await chai.request(server).delete(`/sessions/${testSessionId}?username=expressTests`);
      });

      it('should return a session matching the provided criteria', (done) => {
        chai.request(server).get('/sessions/search?q=timePeriodId=123abc')
          .end((err, res) => {
            res.should.have.status(200);
            res.body[0].should.have.property('_id').to.deep.equal(testSessionId);
            res.body[0].should.have.property('timePeriodId').to.deep.equal('123abc');
            done();
          });
      });
    });
  });

  describe('/POST sessions', () => {
    after(async () => {
      await chai.request(server).delete(`/sessions/${sessionId}?username=expressTests`);
    });

    it('should create a new session with defined values', (done) => {
      chai.request(server).post('/sessions')
        .send(testSession)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.should.have.property('_id');
          // store the id of the new session for deletion after testing
          sessionId = res.body._id;
          res.body.should.have.property('assignedTeam').to.deep.equal(testSession.assignedTeam);
          res.body.should.have.property('deploymentId').to.deep.equal(testSession.deploymentId);
          res.body.should.have.property('deploymentName').to.deep.equal(testSession.deploymentName);
          res.body.should.have.property('days').to.deep.equal(testSession.days);
          res.body.should.have.property('hours').to.deep.equal(testSession.hours);
          res.body.should.have.property('minutes').to.deep.equal(testSession.minutes);
          res.body.should.have.property('status').to.deep.equal(defaultStatus);
          res.body.should.have.property('jira').to.deep.equal(testSession.jira).be.an('array');
          done();
        });
    });
  });

  describe('/POST sessions', () => {
    it('should not create a new session with defined values', (done) => {
      chai.request(server).post('/sessions')
        .send(testSessionWithoutUsername)
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
  });

  describe('/PUT session', () => {
    let putSessionId;
    beforeEach(async () => {
      const response = await chai.request(server).post('/sessions')
        .send(testSession);
      putSessionId = response.body._id;
    });

    afterEach(async () => {
      await chai.request(server).delete(`/sessions/${putSessionId}?username=expressTests`);
    });

    it('should set a time-period Id and change the status', (done) => {
      chai.request(server).put(`/sessions/${putSessionId}`)
        .send(testSessionForUpdate)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('timePeriodId').to.deep.equal(testSessionForUpdate.timePeriodId);
          res.body.should.have.property('status').to.deep.equal(testSessionForUpdate.status);
          res.body.should.have.property('startTime').to.deep.equal(testSessionForUpdate.startTime);
          res.body.should.have.property('endTime').to.deep.equal(testSessionForUpdate.endTime);
          res.body.should.have.property('jira').to.deep.equal(testSessionForUpdate.jira).be.an('array');
          done();
        });
    });
  });

  describe('/PUT session', () => {
    let putSessionId;
    beforeEach(async () => {
      const response = await chai.request(server).post('/sessions')
        .send(testSession);
      putSessionId = response.body._id;
    });

    afterEach(async () => {
      await chai.request(server).delete(`/sessions/${putSessionId}?username=expressTests`);
    });

    it('should not set a time-period Id and change the status', (done) => {
      chai.request(server).put(`/sessions/${putSessionId}`)
        .send(testSessionForUpdateWithoutUsername)
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
  });

  describe('/DELETE delete a session', () => {
    let sessionToBeDeleteId;
    before(async () => {
      const response = await chai.request(server).post('/sessions').send(testSession);
      sessionToBeDeleteId = response.body._id;
    });

    it('should delete the session with corresponding id', async () => {
      await chai.request(server).delete(`/sessions/${sessionToBeDeleteId}?username=expressTests`);
    });
  });

  describe('/DELETE delete a session', () => {
    let sessionToBeDeleteId;
    before(async () => {
      const response = await chai.request(server).post('/sessions').send(testSession);
      sessionToBeDeleteId = response.body._id;
    });
    it('should not delete the session with corresponding id', (done) => {
      chai.request(server).delete(`/sessions/${sessionToBeDeleteId}`)
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
    after(async () => {
      await chai.request(server).delete(`/sessions/${sessionToBeDeleteId}?username=expressTests`);
    });
  });
});
