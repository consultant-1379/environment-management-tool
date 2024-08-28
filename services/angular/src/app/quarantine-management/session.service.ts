import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Session } from '../models/session';
import { TimePeriod } from '../models/timePeriod';
import { Timer } from '../models/timer';
import { TimersService } from './timers.service';
import { TimePeriodService } from './timeperiod.service';
import 'rxjs/add/operator/toPromise';
import { keyCloakUser } from './../utils/app-init';

@Injectable()
export class SessionService {

  API = environment.apiUrl;
  private sessionsUrl = '/sessions';
  constructor(
    private http: HttpClient,
    private timePeriodService: TimePeriodService,
    private timersService: TimersService,
  ) { }

  getAllSessions(): Promise<Session[]> {
    const sessionsGetUrl = '/sessions';
    return this.http.get<Session[]>(this.API + sessionsGetUrl).toPromise();
  }

  async getActiveSessionFromDeploymentId(deploymentId: String): Promise<Session> {
    return this.http.get<Session>(
      `${this.API}/sessions/search/?q=deploymentId=${deploymentId}&q=status=active`)
      .toPromise();
  }

  filterSessionsByStatus(sessions: Session[], status: string): Session[] {
    const sessionsOfType: Session[] = [];
    sessions.forEach((session) => {
      if (session.status === status) {
        sessionsOfType.push(session);
      }
    });
    return sessionsOfType;
  }

  addDeploymentNames(sessions: Session[]) {
    sessions.forEach((session) => {
      this.assignDeploymentName(session);
    });
  }

  async getTimePeriod(deploymentId: String): Promise<TimePeriod> {
    const sessionUrl =
    `${this.API}/sessions/search/?q=deploymentId=${deploymentId}&q=status=active`;
    const session = await this.http.get<Session>(sessionUrl).toPromise();
    return await this.http
    .get<TimePeriod>(`${this.API}/time-periods/${session[0].timePeriodId}`).toPromise();
  }

  async updateEndTimeOfSession(deploymentId: String) {
    const sessionGetUrl =
    `${this.API}${this.sessionsUrl}/search/?q=deploymentId=${deploymentId}&q=status=active`;
    const session = await this.getSession(sessionGetUrl);
    await this.updateSession(session);
  }

  async getSession(sessionGetUrl: string): Promise<Session> {
    return await this.http.get<Session>(sessionGetUrl).toPromise();
  }

  async updateSession(session: Session) {
    this.http.put<Session>(`${this.API}${this.sessionsUrl}/${session[0]._id}`, {
      session: {
        endTime: new Date(),
      },
      username: keyCloakUser.getUsername(),
    }).toPromise();
  }

  async deleteTimer(timePeriodData: TimePeriod): Promise<Timer> {
    return await this.http.delete<Timer>(`${this.API}/timers/${timePeriodData.timerId}`)
      .toPromise();
  }

  async getSessionTimes(session: Session) {
    const timePeriod = await this.timePeriodService.getTimePeriodFromSession(session);
    await this.timersService.getTimer(timePeriod.timerId).then((res) => {
      session.startTime = res.startTime;
      session.endTime = res.endTime;
    });
  }

  private async assignDeploymentName(session: Session) {
    const deploymentInfo = await this.getDeploymentName(session.deploymentId);
    deploymentInfo.forEach((info) => {
      if (info._id === session.deploymentId) {
        session['deploymentName'] = info.name;
      }
    });
  }

  private getDeploymentName(deploymentId: string): Promise<any> {
    const deploymentNameQuery = `/deployments/search?_id='${deploymentId}'&fields=name`;
    return this.http.get<Session>(this.API + deploymentNameQuery).toPromise();
  }
}
