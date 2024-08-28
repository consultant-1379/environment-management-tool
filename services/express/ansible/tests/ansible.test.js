const request = require('supertest');
const express = require('express');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const server = require('../../server');

chai.use(chaiHttp);

let environmentId;

const testEnvironment = {
  sessionUsername: 'testuser1',
  sessionPassword: 'testuser1',
  username: 'expressTests',
  vmType: 'ms1',
};
const testEnvironmentForWlvm = {
  sessionUsername: 'testuser1',
  sessionPassword: 'testuser1',
  username: 'expressTests',
  vmType: 'wlvm',
};
const invalidTestEnvironment = {
  username: 'expressTests',
};

describe('ansible', () => {
  describe('Ansible positive testcases', function test() {
    // overriding the default timeout(2000ms) of mocha
    this.timeout(15000);
    it('should setup passwordless connection with the default environment', (done) => {
      chai.request(server).post(`/ansible/setup-passwordless-connection/${environmentId}`)
        .send({
          username: `${testEnvironment.username}`,
          createUserOnWlvm: false,
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it('should create a new user with default values', (done) => {
      chai.request(server).post('/ansible/create-user-for-session')
        .send(testEnvironment)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it('should create a new user on wlvm with default values', (done) => {
      chai.request(server).post('/ansible/create-user-for-session')
        .send(testEnvironmentForWlvm)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it('should delete a user with default values', (done) => {
      const additionalQuery = `&sessionUsername=${testEnvironment.sessionUsername}&username=${testEnvironment.username}
      &vmType=${testEnvironment.vmType}`;
      chai.request(server).delete(`/ansible/delete-user-from-session?clusterId=${environmentId}${additionalQuery}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it('should setup passwordless connection on ms and wlvm with the default environment', (done) => {
      chai.request(server).post('/ansible/setup-passwordless-connection/1234')
        .send({
          username: `${testEnvironment.username}`,
          createUserOnWlvm: true,
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it('should send message to user successfully', (done) => {
      chai.request(server).post('/ansible/send-message-to-user-terminal/1234')
        .send({
          username: `${testEnvironment.username}`,
          troubleshootingUser: `${testEnvironment.sessionUsername}`,
          message: 'test',
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it('should remove passwordless connection with workload', (done) => {
      chai.request(server).delete('/ansible/remove-workload-entry-from-ansible-host-file/1234')
        .send({
          username: `${testEnvironment.username}`,
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
  describe('Ansible negative testcases', function test() {
    // overriding the default timeout(2000ms) of mocha
    this.timeout(10000);
    it('should not create a new user with default values', (done) => {
      chai.request(server).post('/ansible/create-user-for-session')
        .send(invalidTestEnvironment)
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
    it('should not delete a user with default values', (done) => {
      const additionalQuery = `?clusterId=${environmentId}&sessionUsername=${testEnvironment.sessionUsername}`;
      chai.request(server).delete(`/ansible/delete-user-from-session${additionalQuery}`)
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
    it('should not delete a user with default values', (done) => {
      const additionalQuery = `?clusterId=${environmentId}&username=${testEnvironment.username}`;
      chai.request(server).delete(`/ansible/delete-user-from-session${additionalQuery}`)
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
    it('should not send message to user with no clusterId specified', (done) => {
      chai.request(server).post('/ansible/send-message-to-user-terminal/')
        .send({
          username: `${testEnvironment.username}`,
          troubleshootingUser: `${testEnvironment.sessionUsername}`,
          message: 'test',
        })
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
    it('should not send message to user without username specified', (done) => {
      chai.request(server).post('/ansible/send-message-to-user-terminal/1234')
        .send({
          message: 'test',
          troubleshootingUser: `${testEnvironment.sessionUsername}`,
        })
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
    it('should not send message to user without all required fields specified', (done) => {
      chai.request(server).post('/ansible/send-message-to-user-terminal/1234')
        .send({
          username: `${testEnvironment.username}`,
          troubleshootingUser: `${testEnvironment.sessionUsername}`,
        })
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
    it('should not remove passwordless connection with wlvm without username specified', (done) => {
      chai.request(server).delete('/ansible/remove-workload-entry-from-ansible-host-file/1234')
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });
  });
});
