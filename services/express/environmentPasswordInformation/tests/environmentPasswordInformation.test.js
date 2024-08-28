const request = require('supertest');
const express = require('express');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const server = require('../../server');

chai.use(chaiHttp);

const environmentName = '294';
const firstLmsPassword = '12shroot';
const secondLmsPassword = 'shroot';
const firstWlvmPassword = '12shroot';
const secondWlvmPassword = 'shroot';
const invalidEnvironmentName = 'iDontExist';

describe('environmentPasswordInformation', () => {
  let environmentPasswordInformationId;
  let environmentId;

  before(() => {
    chai.request(server).post('/deployments')
      .send({
        name: environmentName,
        testPhase: 'MTE',
        deploymentType: 'FUNCTIONAL',
        platformType: 'physical',
        username: 'express-tests',
      })
      .end((err, response) => {
        if (err) throw err;
        environmentId = response.body._id;
      });
  });

  describe('/GET INVALID REQUEST', () => {
    it('should throw error if trying to get the non-existing environment password information of an environment', (done) => {
      chai.request(server).get(`/environment-password-information/${environmentName}`)
        .end((err, res) => {
          if (err) throw err;
          res.should.have.status(404);
          res.body.should.have.property('message').to.deep
            .equal(`${environmentName} does not have environment password information`);
          done();
        });
    });
  });
  describe('/PUT REQUEST', () => {
    it('should create new environment password information', (done) => {
      chai.request(server).put(`/environment-password-information/${environmentName}`)
        .send({
          lmsPassword: firstLmsPassword,
          wlvmPassword: firstWlvmPassword,
          username: 'express-tests',
        })
        .end((err, res) => {
          if (err) throw err;
          environmentPasswordInformationId = res.body._id;
          res.should.have.status(200);
          res.body.should.have.property('environmentName').to.deep.equal(environmentName);
          res.body.should.have.property('lmsPassword').to.deep.equal(firstLmsPassword);
          res.body.should.have.property('wlvmPassword').to.deep.equal(firstWlvmPassword);
          done();
        });
    });

    it('should throw error if trying to create new environment password information without specifying user', (done) => {
      chai.request(server).put(`/environment-password-information/${environmentName}`)
        .send({
          lmsPassword: firstLmsPassword,
          wlvmPassword: firstWlvmPassword,
        })
        .end((err, res) => {
          if (err) throw err;
          res.should.have.status(400);
          res.body.should.have.property('message').to.deep.equal('You must specify a username');
          done();
        });
    });

    it('should throw error if trying to create new environment password information for a non existent environment', (done) => {
      chai.request(server).put(`/environment-password-information/${invalidEnvironmentName}`)
        .send({
          lmsPassword: firstLmsPassword,
          wlvmPassword: firstWlvmPassword,
          username: 'express-tests',
        })
        .end((err, res) => {
          if (err) throw err;
          res.should.have.status(404);
          res.body.should.have.property('message').to.deep.equal('Environment not found in EMT');
          done();
        });
    });

    it('should update environment password information if exists already', (done) => {
      chai.request(server).put(`/environment-password-information/${environmentName}`)
        .send({
          lmsPassword: secondLmsPassword,
          wlvmPassword: secondWlvmPassword,
          username: 'express-tests',
        })
        .end((err, res) => {
          if (err) throw err;
          res.should.have.status(200);
          res.body.should.have.property('environmentName').to.deep.equal(environmentName);
          res.body.should.have.property('lmsPassword').to.deep.equal(secondLmsPassword);
          res.body.should.have.property('wlvmPassword').to.deep.equal(secondWlvmPassword);
          res.body.should.have.property('_id').to.deep.equal(environmentPasswordInformationId);
          done();
        });
    });

    after(async () => {
      const removeEnvironmentCommand = `/deployments/${environmentId}?username=express&environmentName=${environmentName}`;
      await chai.request(server).delete(removeEnvironmentCommand);
    });
  });
  describe('/GET REQUEST', () => {
    it('should get the environment password information of an environment', (done) => {
      chai.request(server).get(`/environment-password-information/${environmentName}`)
        .end((err, res) => {
          if (err) throw err;
          res.should.have.status(200);
          res.body.should.have.property('environmentName').to.deep.equal(environmentName);
          res.body.should.have.property('lmsPassword').to.deep.equal(secondLmsPassword);
          res.body.should.have.property('wlvmPassword').to.deep.equal(secondWlvmPassword);
          res.body.should.have.property('_id').to.deep.equal(environmentPasswordInformationId);
          done();
        });
    });
  });

  describe('/DELETE REQUEST', () => {
    it('should delete the environment password information with the corresponding id', (done) => {
      chai.request(server).delete(`/environment-password-information/${environmentPasswordInformationId}`)
        .end((err, res) => {
          if (err) throw err;
          res.should.have.status(204);
          done();
        });
    });
    it('should throw error if trying to delete non-existing environment password information', (done) => {
      chai.request(server).delete('/environment-password-information/invalidId')
        .end((err, res) => {
          res.body.should.have.property('message').to.deep.equal('Error deleting environment password information.');
          res.should.have.status(500);
          done();
        });
    });
  });
});
