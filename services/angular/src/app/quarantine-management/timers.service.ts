import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Timer } from '../models/timer';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class TimersService {

  private API = environment.apiUrl;
  constructor(private http: HttpClient) { }

  async getTimer(timerId): Promise<Timer> {
    const timerUrl = `${this.API}/timers/${timerId}`;
    return await this.http.get<Timer>(timerUrl).toPromise();
  }
}
