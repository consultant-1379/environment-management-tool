import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { keyCloakUser } from './../utils/app-init';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { Deployment } from '../models/deployment';

@Injectable()
export class DeploymentService {

  API = environment.apiUrl;
  DEPLOYMENTS_API = `${this.API}/deployments`;
  DEPLOYMENTS_SEARCH_API = `${this.DEPLOYMENTS_API}/search/`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) { }

  public getAllDeployments(testPhases?: string): Observable<Deployment[]> {
    return this.http.get<Deployment[]>(`${this.DEPLOYMENTS_SEARCH_API}?q=testPhase=${testPhases}`);
  }

  public getAllDeploymentsByState(deploymentState: string, testPhases?: string):
    Observable<Deployment[]> {
    return this.http.
      get<Deployment[]>(`${this.DEPLOYMENTS_SEARCH_API}?q=state=${deploymentState}`
        + `&q=testPhase=${testPhases}`);
  }

  public getDeploymentsByType(platformType: String, testPhases?: string): Observable<Deployment[]> {
    if (platformType !== 'ALL') {
      return this.http.get<Deployment[]>(`${this.DEPLOYMENTS_SEARCH_API}`
        + `?q=platformType=${platformType}&q=testPhase=${testPhases}`);
    }
    return this.getAllDeployments(testPhases);
  }

  public getDeploymentsForChart(testPhases?: string, platformType?: string):
    Observable<Deployment[]> {
    return this.getDeploymentsByType(platformType, testPhases);
  }

  public getDeploymentsByState(deploymentState: string, platformType: string, testPhases?: string):
    Observable<Deployment[]> {
    return this.http.
      get<Deployment[]>(`${this.DEPLOYMENTS_SEARCH_API}?q=platformType=${platformType}`
        + `&q=state=${deploymentState}&q=testPhase=${testPhases}`);
  }

  public deploymentsForTableType(deploymentState: string, platformType: string,
                                 testPhases?: string):
    Observable<Deployment[]> {
    if (platformType !== 'ALL') {
      return this.getDeploymentsByState(deploymentState, platformType, testPhases);
    }
    return this.getAllDeploymentsByState(deploymentState, testPhases);
  }

  public updateDeployment(
    deploymentToEdit: Deployment): Observable<Deployment> {
    const url = `${this.DEPLOYMENTS_API}/${deploymentToEdit._id}`;
    const requestBody = {
      deployment: deploymentToEdit,
      username: keyCloakUser.getUsername(),
    };
    return this.http.put<Deployment>(url, requestBody, this.httpOptions);
  }

  public updateDeploymentOtherInfo(
    deploymentToEdit: Deployment, otherInfos: string):
    Observable<Deployment> {
    const url = `${this.DEPLOYMENTS_API}/${deploymentToEdit._id}`;
    const requestBody = {
      otherInfo: otherInfos,
      name: deploymentToEdit.name,
      username: keyCloakUser.getUsername(),
    };
    return this.http.put<Deployment>(url, requestBody, this.httpOptions);
  }

  public getDeploymentById(deploymentId: string): Observable<Deployment> {
    return this.http.get<Deployment>(`${this.DEPLOYMENTS_API}/search?q=_id=${deploymentId}`);
  }

  public addEnvironment(
    deploymentToAdd: Deployment): Promise<Deployment> {
    const requestBody = {
      deployment: deploymentToAdd,
      username: keyCloakUser.getUsername(),
    };
    return this.http.post<Deployment>(this.DEPLOYMENTS_API, requestBody)
      .toPromise();
  }

  public async removeEnvironment(deployment: Deployment) {
    const additionalQuery =
    `?username=${keyCloakUser.getUsername()}&environmentName=${deployment.name}`;
    return await this.convertPromiseToObject(
      this.http.delete<Deployment>(
        `${this.DEPLOYMENTS_API}/${deployment._id}${additionalQuery}`)
        .toPromise());
  }

  public async getEnvironmentByName(environmentName: String): Promise<Deployment> {
    return this.http.get<Deployment>(`${this.DEPLOYMENTS_SEARCH_API}?q=name=${environmentName}`)
      .toPromise();
  }

  private convertPromiseToObject(promise: Promise<Object>): any {
    return promise.then((result) => {
      return result;
    });
  }
}
