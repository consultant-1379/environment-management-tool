import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { keyCloakUser } from '../utils/app-init';
import { Observable } from 'rxjs';

@Injectable()
export class AnsibleService {

  private URL = environment.apiUrl;
  private ANSIBLE_URL = `${this.URL}/ansible`;
  constructor(
    private http: HttpClient,
  ) { }

  ensurePasswordlessConnectionToEnvironment(clusterId: string,
                                            createUserOnWlvm: boolean): Observable<any> {
    const requestBody = {
      createUserOnWlvm,
      username: keyCloakUser.getUsername(),
    };

    return this.http.post<any>(
      `${this.ANSIBLE_URL}/setup-passwordless-connection/${clusterId}`, requestBody);
  }

  createUserInMsOrWlvm(environmentName: string, username: string, password: string,
                       vmType: string): Observable<any> {
    const requestBody = {
      vmType,
      clusterId: environmentName,
      sessionUsername: username,
      sessionPassword: password,
      username: keyCloakUser.getUsername(),
    };
    return this.http.post<any>(`${this.ANSIBLE_URL}/create-user-for-session`, requestBody);
  }

  deleteUserFromMsOrWlvm(environmentName: string, username: string,
                         vmType: string): Observable<any> {
    const additionalQuery =
              `?clusterId=${environmentName}&sessionUsername=${username}
              &username=${keyCloakUser.getUsername()}&vmType=${vmType}`;
    return this.http.delete<any>(`${this.ANSIBLE_URL}/delete-user-from-session${additionalQuery}`);
  }
}
