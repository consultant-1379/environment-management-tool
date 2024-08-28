const request = require('supertest');
const express = require('express');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const server = require('../../server');

chai.use(chaiHttp);

const testTimePeriod = {
  durationHours: 10,
  durationMinutes: 10,
  timerId: '',
};
let testTimePeriodId;

describe('timePeriods', () => {
  describe('/GET time periods', () => {
    describe('time-periods/', () => {
      it('should get all time periods', (done) => {
        chai.request(server).get('/time-periods')
          .end((err, res) => {
            if (err) throw err;
            res.should.have.status(200);
            res.body.should.have.length(0);
            res.body.should.be.an('array');
            done();
          });
      });
    });
  });

  describe('/POST time periods', () => {
    afterEach(async () => {
      await chai.request(server).delete(`/time-periods/${testTimePeriodId}`);
    });

    it('should create a new time period with default values', (done) => {
      chai.request(server).post('/time-periods')
        .send(testTimePeriod)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.should.have.property('_id');
          // set the id of the new time period
          // to be deleted after testing
          testTimePeriodId = res.body._id;
          res.body.should.have.property('durationHours').to.deep.equal(testTimePeriod.durationHours);
          res.body.should.have.property('durationMinutes').to.deep.equal(testTimePeriod.durationMinutes);
          done();
        });
    });
  });

  describe('/PUT time periods', () => {
    let putTimePeriodId;
    let putTimerId;
    before(async () => {
      const response = await chai.request(server).post('/time-periods')
        .send(testTimePeriod);
      putTimePeriodId = response.body._id;
    });

    after(async () => {
      await chai.request(server).delete(`/time-periods/${putTimePeriodId}`);
      await chai.request(server).delete(`/timers/${putTimerId}`);
    });

    function delay(interval) {
      return it('should delay', (done) => {
        setTimeout(() => done(), interval);
      }).timeout(interval + 100);
    }

    it('should set a timers ID', (done) => {
      chai.request(server).put(`/time-periods/${putTimePeriodId}`)
        .end((err, res) => {
          putTimerId = res.body.timerId;
          res.should.have.status(201);
          res.body.should.have.property('timerId').not.to.deep.equal(null);
          done();
        });
    });

    delay(100);

    it('should try to set a timers ID but see that a timer has already been set', (done) => {
      chai.request(server).put(`/time-periods/${putTimePeriodId}`)
        .end((err, res) => {
          res.should.have.status(202);
          res.body.should.have.property('message').to.deep.equal('Time Period has already started timer');
          done();
        });
    });
  });

  describe('/DELETE time period', () => {
    let timePeriodToDeleteId;
    before(async () => {
      const response = await chai.request(server).post('/time-periods').send(testTimePeriod);
      timePeriodToDeleteId = response.body._id;
    });

    it('should delete the time period with corresponding id', async () => {
      await chai.request(server).delete(`/time-periods/${timePeriodToDeleteId}`);
    });
  });
});
