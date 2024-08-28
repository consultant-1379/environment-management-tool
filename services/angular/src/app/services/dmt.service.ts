import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DmtService {

  API = environment.apiUrl;
  private CIFWK_URL: string = 'https://ci-portal.seli.wh.rnd.internal.ericsson.com';

  constructor(private http: HttpClient) { }

  public getDeploymentDmtLink(clusterId: String): string {
    return `${this.CIFWK_URL}/dmt/clusters/${clusterId}`;
  }

  public getDeploymentDescription(clusterId: String): Observable<any> {
    return this.http.get(`${this.API}/dmt/deploymentDescription/${clusterId}`);
  }

  public getDeploymentHttpdFqdn(clusterId: String): Observable<any> {
    return this.http.get(`${this.API}/dmt/deploymentTafProperties/${clusterId}`);
  }

  public getDeploymentDdpSite(clusterId: String): Observable<any> {
    return this.http.get(`${this.API}/dmt/getClusterAdditionalProperties/${clusterId}`);
  }

}
