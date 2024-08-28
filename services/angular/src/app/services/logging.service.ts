import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as moment from 'moment-timezone';

@Injectable()
export class Logger {

  ELASTIC_SEARCH_ANGULAR = 'http://atvts2665.athtem.eei.ericsson.se:9200/angularlogs';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) { }

  info(logMessage: string, additionalTags?: object) {
    // To be looked into as part of RTD-10228
    if (process.env.NODE_ENV === 'NOT_READY_FOR_PRODUCTION') {
      const timeNow = moment.utc();
      let infoMessage: object = {
        '@timestamp': timeNow,
        name: 'Angular Logs',
        hostname: window.location.hostname,
        message: logMessage,
      };
      if (additionalTags !== undefined) {
        infoMessage = { ...infoMessage, ...additionalTags };
      }
      const elasticSearchURI = `${this.ELASTIC_SEARCH_ANGULAR}-${timeNow.format('YYYY.MM.DD')}/_doc`;
      this.http.post(elasticSearchURI, infoMessage, this.httpOptions).toPromise();
    }
  }
}
