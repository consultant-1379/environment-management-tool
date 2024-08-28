import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TimePeriod } from '../models/timePeriod';
import { Session } from '../models/session';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class TimePeriodService {

  private API = environment.apiUrl;
  constructor(private http: HttpClient) { }

  async getTimePeriodFromSession(session: Session): Promise<TimePeriod> {
    const timePeriodUrl = `${this.API}/time-periods/${session.timePeriodId}`;
    return await this.http.get<TimePeriod>(timePeriodUrl).toPromise();
  }
}