import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as moment from 'moment-timezone';

import { Session } from '../models/session';
import { TimePeriod } from '../models/timePeriod';
import { Deployment } from '../models/deployment';
import { Mailer } from '../models/mailer';
import { SessionService } from '../quarantine-management/session.service';
import { Timer } from '../models/timer';
import { sessionCreated } from '../emails/sessionCreatedEmail';
import { sessionCreatedOperation } from '../emails/sessionCreatedOperationEmail';
import { sessionUpdated } from '../emails/sessionUpdatedEmail';
import { sessionUpdatedOperation } from '../emails/sessionUpdatedOperationEmail';
import { sessionUpdatedWithDeleteUser } from '../emails/sessionUpdatedWithDeleteUserEmail';
import { keyCloakUser } from './../utils/app-init';
import { Observable } from 'rxjs';

// tslint:disable: max-line-length
enum LIST_OF_OPS_MAILS {
  MTE = 'PDLMTOPSMT@pdl.internal.ericsson.com',
  CDL = 'Ericsson.ENMMTV@tcs.com',
  LongLoop = 'Ericsson.ENMMTV@tcs.com',
  PLM = 'PDLENMSPIN@pdl.internal.ericsson.com',
  DROPBACK = 'PDLENMSPIN@pdl.internal.ericsson.com',
  RVB = 'PDLENM14BR@pdl.internal.ericsson.com',
  ENDURANCE = 'PDLENMBLAC@pdl.internal.ericsson.com',
  STKPI = 'PDLENM14BR@pdl.internal.ericsson.com',
  RTD = 'PDLTORBLAD@pdl.internal.ericsson.com,EricssonENM.Bravo@tcs.com,BumbleBee.ENM@tcs.com',
  SprintValidation = 'TeamWhiteWalkers@tcscomprod.onmicrosoft.com,enmtargaryens.hyd@tcs.com,pdlenmlant@pdl.internal.ericsson.com',
  CS = 'PDLMIROICB@pdl.internal.ericsson.com,PDLLMIROCB@pdl.internal.ericsson.com',
}
// tslint:enable: max-line-length

@Injectable()
export class DeploymentSessionService {

  private URL = environment.apiUrl;
  private PERIODURL = `${this.URL}/time-periods`;
  private SESSIONURL = `${this.URL}/sessions`;
  private MAILERURL = `${this.URL}/mailer`;
  private DEPLOYMENTURL = `${this.URL}/deployments`;
  private TIMERURL = `${this.URL}/timers`;
  private startLMI;
  private expiryLMI;
  private differenceInHours;
  private differenceInMinutes;
  private timePeriodToUpdate: TimePeriod;

  mailerData: Mailer = new Mailer;
  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
  ) { }

  async beginTimePeriod(periodData: TimePeriod, sessionData: Session) {
    const periodPromise = this.createTimePeriod(periodData);
    let period: TimePeriod;
    period = await this.convertPromiseToObject(periodPromise);
    await this.startTimePeriod(period);
    sessionData.timePeriodId = period._id;
    sessionData.status = 'active';
    await this.sessionService.getSessionTimes(sessionData);
    await this.updateSession(sessionData);
  }

  async changeTimePeriod(timer: Timer, session: Session) {
    this.timePeriodToUpdate
    = await this.convertPromiseToObject(
      this.sessionService.getTimePeriod(session.deploymentId));
    const startMoment = moment(timer.startTime);
    const endMoment = moment(timer.endTime);
    const durationHours = endMoment.diff(startMoment, 'hours');
    const durationMinutes =
      endMoment.diff(startMoment, 'minutes') - (durationHours * 60);
    this.timePeriodToUpdate.durationHours = durationHours;
    this.timePeriodToUpdate.durationMinutes = durationMinutes;
    await this.updateTimePeriod(this.timePeriodToUpdate);
  }

  async changeTimer(timePeriodToUpdate: TimePeriod, sessionData: Session) {
    const timePeriod
    = await this.convertPromiseToObject(
      this.sessionService.getTimePeriod(sessionData.deploymentId));
    timePeriodToUpdate.timerId = timePeriod.timerId;
    await this.updateTimer(timePeriodToUpdate);
  }

  getSessions() {
    return this.convertPromiseToObject(this.http.get<Session>(`${this.URL}/sessions`)
    .toPromise());
  }

  createSession(sessionData: Session): Observable<Session> {
    const requestBody = {
      session: sessionData,
      username: keyCloakUser.getUsername(),
    };
    return this.http.post<Session>(this.SESSIONURL, requestBody);
  }

  checkSessionsOnDeployment(deploymentId: String) {
    return this.convertPromiseToObject(this.http.get<Session>(
      `${this.URL}/sessions/search?q=deploymentId=${deploymentId}&q=status=active`)
    .toPromise());
  }

  updateSession(sessionData: Session): Promise<Session> {
    const sessionToEdit = {
      // TODO: REFACTOR will be needed here.
      // For now if you want to PUT a field other that status for timePeriodId
      // you can just add it in here.
      // Ideally the method should be taking an object of type Session
      status: sessionData.status,
      timePeriodId: sessionData.timePeriodId,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      jira: sessionData.jira,
      assignedTeam: sessionData.assignedTeam,
      assignedUserNames: sessionData.assignedUserNames,
      assignedUserEmails: sessionData.assignedUserEmails,
      hours: sessionData.hours,
      minutes: sessionData.minutes,
      sessionUsername: sessionData.sessionUsername,
      sessionPassword: sessionData.sessionPassword,
      teamEmail: sessionData.teamEmail,
      createUserOnWlvm: sessionData.createUserOnWlvm,
    };
    const requestBody = {
      session: sessionToEdit,
      username: keyCloakUser.getUsername(),
    };
    return this.http.put<Session>(`${this.SESSIONURL}/${sessionData._id}`, requestBody)
      .toPromise();
  }

  createTimePeriod(periodData: TimePeriod): Promise<TimePeriod> {
    return this.http.post<TimePeriod>(this.PERIODURL, periodData)
      .toPromise();
  }

  startTimePeriod(period: TimePeriod): Promise<TimePeriod> {
    return this.http.put<TimePeriod>(`${this.PERIODURL}/${period._id}`, { period })
      .toPromise();
  }

  updateTimePeriod(period: TimePeriod): Promise<TimePeriod> {
    return this.http.put<TimePeriod>(
      `${this.PERIODURL}/update/${this.timePeriodToUpdate._id}`, { period })
      .toPromise();
  }

  async fetchDeployment(deploymentId : String) : Promise<Deployment> {
    return this.http.get<Deployment>(`${this.DEPLOYMENTURL}/search/?q=_id=${deploymentId}`)
    .toPromise();
  }

  async getTimer(periodId): Promise<Timer> {
    return await this.http.get<TimePeriod>(`${this.PERIODURL}/${periodId}`)
    .toPromise()
    .then((periodData) => {
      return this.http.get<Timer>(`${this.TIMERURL}/${periodData.timerId}`).toPromise();
    });
  }

  async updateTimer(period: TimePeriod): Promise<Timer> {
    return this.http.put<Timer>(`${this.TIMERURL}/${period.timerId}`, { period })
      .toPromise();
  }

  async sendEmail(sessionData : Session, deploymentTestPhase : string,
                  createUserOnWlvm : boolean): Promise<any> {
    const deploymentData =
      await this.convertPromiseToObject(this.fetchDeployment(sessionData.deploymentId));
    await this.getSessionTimes(sessionData);
    const sessionAssignees = sessionData.assignedTeam.concat(sessionData.assignedUserNames);
    const sessionAssigneeEmails = sessionData.teamEmail.concat(sessionData.assignedUserEmails);
    this.mailerData.emailSubject =
     `A Quarantined test environment ${deploymentData[0].name}
      has been allocated for your investigation`;
    this.mailerData.sessionAssignees = sessionAssignees;
    this.mailerData.ccId = '';
    await this.sendAssigneesEmail(sessionData, sessionAssignees, sessionAssigneeEmails,
                                  deploymentData, createUserOnWlvm);
    await this.sendOperationsEmail(sessionData, sessionAssignees,
                                   deploymentTestPhase, deploymentData);
  }

  async sendAssigneesEmail(sessionData : Session, sessionAssignees : string[],
                           sessionAssigneeEmails : string[], deploymentData : Deployment,
                           createUserOnWlvm : boolean) {
    for (const assignedAssigneesIndex in sessionAssignees) {
      this.mailerData.emailId = [sessionAssigneeEmails[assignedAssigneesIndex]];
      this.mailerData.emailBody = sessionCreated(
        sessionData, sessionAssignees, deploymentData, this.startLMI, this.expiryLMI,
        assignedAssigneesIndex, sessionData.sessionUsername,
        sessionData.sessionPassword, createUserOnWlvm);
      await this.http.post(this.MAILERURL, this.mailerData).toPromise();
    }
  }

  async sendOperationsEmail(sessionData : Session, sessionAssignees : string[],
                            deploymentTestPhase : string, deploymentData : Deployment) {
    this.mailerData.emailId = [this.retrieveEmailMappedToTestPhase(deploymentTestPhase)];
    this.mailerData.emailBody = sessionCreatedOperation(
      sessionData, sessionAssignees, deploymentData, this.startLMI, this.expiryLMI,
    );
    await this.http.post(this.MAILERURL, this.mailerData).toPromise();
  }

  async sendDeleteUserEmail(environment : string, sessionUsername : string,
                            deploymentTestPhase : string, vmType : string): Promise<any> {
    this.mailerData.emailId = [this.retrieveEmailMappedToTestPhase(deploymentTestPhase)];
    this.mailerData.ccId = '';
    this.mailerData.emailSubject =
     `WARNING: EMT did not delete the user ${sessionUsername}
      from Test Environment ${environment}`;
    this.mailerData.emailBody = sessionUpdatedWithDeleteUser(
      environment, sessionUsername, vmType,
    );
    await this.http.post(this.MAILERURL, this.mailerData).toPromise();
  }

  async sendSessionUpdatedEmail(sessionData : Session, allSessionAssigneeEmails : string[],
                                allSessionAssignees : string[], addedAssignees : string[],
                                removedAssignees : string[], wasDurationChanged: boolean,
                                oldHours: number, oldMinutes: number, deploymentTestPhase: string,
                                createUserOnWlvm : boolean):
                                Promise<any> {
    const deploymentData =
      await this.convertPromiseToObject(this.fetchDeployment(sessionData.deploymentId));
    await this.getSessionTimes(sessionData);
    this.mailerData.sessionAssignees = allSessionAssignees;
    this.mailerData.emailSubject =
     `The session assigned to you on test environment ${deploymentData[0].name}
      has been updated`;
    this.mailerData.ccId = '';
    await this.sendAssigneesUpdatedEmail(sessionData, deploymentData, allSessionAssigneeEmails,
                                         allSessionAssignees, addedAssignees,
                                         removedAssignees, wasDurationChanged, oldHours,
                                         oldMinutes, createUserOnWlvm);
    await this.sendOperationsUpdatedEmail(sessionData, deploymentData, deploymentTestPhase,
                                          allSessionAssignees, addedAssignees, removedAssignees,
                                          wasDurationChanged, oldHours, oldMinutes);
  }

  async sendAssigneesUpdatedEmail(sessionData : Session, deploymentData : Deployment,
                                  allSessionAssigneeEmails : string[],
                                  allSessionAssignees : string[], addedAssignees : string[],
                                  removedAssignees : string[], wasDurationChanged: boolean,
                                  oldHours: number, oldMinutes: number,
                                  createUserOnWlvm : boolean) {
    for (const assignedAssigneesIndex in allSessionAssignees) {
      this.mailerData.emailId = [allSessionAssigneeEmails[assignedAssigneesIndex]];
      this.mailerData.emailBody = sessionUpdated(
        sessionData, deploymentData, allSessionAssignees, addedAssignees, removedAssignees,
        this.differenceInHours, this.differenceInMinutes, this.startLMI, this.expiryLMI,
        wasDurationChanged, oldHours, oldMinutes, assignedAssigneesIndex,
        sessionData.sessionUsername, sessionData.sessionPassword, createUserOnWlvm);
      await this.http.post(this.MAILERURL, this.mailerData).toPromise();
    }
  }

  async sendOperationsUpdatedEmail(sessionData : Session, deploymentData : Deployment,
                                   deploymentTestPhase : string, allSessionAssignees : string[],
                                   addedAssignees : string[], removedAssignees : string[],
                                   wasDurationChanged: boolean, oldHours: number,
                                   oldMinutes: number) {
    this.mailerData.emailId = [this.retrieveEmailMappedToTestPhase(deploymentTestPhase)];
    this.mailerData.emailBody = sessionUpdatedOperation(
      sessionData, deploymentData, allSessionAssignees, addedAssignees, removedAssignees,
      this.differenceInHours, this.differenceInMinutes, this.startLMI, this.expiryLMI,
      wasDurationChanged, oldHours, oldMinutes,
    );
    await this.http.post(this.MAILERURL, this.mailerData).toPromise();
  }

  private async getSessionTimes(sessionData : Session) {
    const timerData = await this.convertPromiseToObject(this.getTimer(sessionData.timePeriodId));
    const startMoment = moment(timerData.startTime);
    const expiryMoment = moment(timerData.endTime);
    this.startLMI = startMoment.tz('Europe/Dublin').format('MMMM Do YYYY, h:mm:ss a');
    this.expiryLMI = expiryMoment.tz('Europe/Dublin').format('MMMM Do YYYY, h:mm:ss a');
    const timeRightNow = moment.utc();
    this.differenceInHours = expiryMoment.diff(timeRightNow, 'hours');
    this.differenceInMinutes =
      expiryMoment.diff(timeRightNow, 'minutes') - (this.differenceInHours * 60);
  }

  private retrieveEmailMappedToTestPhase(deploymentTestPhase : string): string {
    return LIST_OF_OPS_MAILS[deploymentTestPhase];
  }

  private convertPromiseToObject(promise: Promise<Object>): any {
    return promise.then((result) => {
      return result;
    });
  }
}
