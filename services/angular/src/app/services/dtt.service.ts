import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DttService {

  DTT_URL = 'https://atvdtt.athtem.eei.ericsson.se/api';
  DTT_DEPLOYMENTS_URL = `${this.DTT_URL}/deployments/`;

  QUERY = '?q=';
  DEPLOYMENT_NAME_QUERY = 'name=';

  constructor(private http: HttpClient) { }

  public getCenmDeploymentDocument(deploymentName: string): object {
    const dttDeploymentName = deploymentName.substr(7);
    const deploymentDttUrl = this.DTT_DEPLOYMENTS_URL + this.QUERY
    + this.DEPLOYMENT_NAME_QUERY + dttDeploymentName;
    return this.convertPromiseToObject(this.http.get(deploymentDttUrl).toPromise().catch((err) => {
      console.log(`Error fetching DTT link for ${deploymentName}`);
      throw err;
    }));
  }

  public getCenmDeploymentId(deploymentDocument: object): string {
    return deploymentDocument[0]['_id'];
  }

  private convertPromiseToObject(promise: Promise<Object>): any {
    return promise.then((result) => {
      return result;
    });
  }
}
