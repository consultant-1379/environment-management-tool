const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');

const should = chai.should();
chai.use(chaiHttp);

const testHours = 6;
const testDays = 1;
const testMinutes = 35;
const testTimer = {
  durationDays: testDays,
  durationHours: testHours,
  durationMinutes: testMinutes,
};

let testTimerId;

describe('timers', () => {
  describe('/POST deployments', () => {
    afterEach(async () => {
      await chai.request(server).delete(`/timers/${testTimerId}`);
    });

    it('should create a new timer', (done) => {
      chai.request(server).post('/timers')
        .send(testTimer)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.should.have.property('_id');
          const currDate = new Date();
          const expectedStartTime = new Date();
          currDate.setDate(currDate.getDate() + testDays);
          currDate.setHours(currDate.getHours() + testHours);
          currDate.setMinutes(currDate.getMinutes() + testMinutes);
          const expectedEndTime = currDate;
          testTimerId = res.body._id;
          const testStartTime = new Date(res.body.startTime);
          const testEndTime = new Date(res.body.endTime);

          testStartTime.getMinutes().should.be.eql(expectedStartTime.getMinutes());
          testStartTime.getHours().should.be.eql(expectedStartTime.getHours());
          testStartTime.getDate().should.be.eql(expectedStartTime.getDate());

          testEndTime.getMinutes().should.be.eql(expectedEndTime.getMinutes());
          testEndTime.getHours().should.be.eql(expectedEndTime.getHours());
          testEndTime.getDate().should.be.eql(expectedEndTime.getDate());

          done();
        });
    });
  });

  describe('/GET a timer', () => {
    before(async () => {
      const response = await chai.request(server).post('/timers').send(testTimer);
      testTimerId = response.body._id;
    });

    after(async () => {
      await chai.request(server).delete(`/timers/${testTimerId}`);
    });

    it('should fetch a timer', (done) => {
      chai.request(server).get(`/timers/${testTimerId}`)
        .send(testTimer)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('_id').eql(testTimerId);
          done();
        });
    });
  });

  describe('/DELETE a timer', () => {
    before(async () => {
      const response = await chai.request(server).post('/timers').send(testTimer);
      testTimerId = response.body._id;
    });

    it('should delete the timer with corresponding id', async () => {
      await chai.request(server).delete(`/timers/${testTimerId}`);
    });
  });
});
