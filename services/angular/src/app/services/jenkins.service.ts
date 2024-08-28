import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class JenkinsService {
  private URL = environment.apiUrl;
  private JENKINS_URL = `${this.URL}/jenkins`;
  constructor(
    private http: HttpClient,
  ) { }
  async triggerJenkinsJob(clusterId: string, platformType: String) {
    let isCallMade = true;
    const requestBody = {
      platformType,
      clusterID: clusterId,
    };
    await this.http.post(`${this.JENKINS_URL}/trigger-jenkins-job`, requestBody).toPromise()
    .catch(() => {
      isCallMade = false;
      const message = 'Failed when triggering jenkins job';
      console.log(message);
    });
  }
}
