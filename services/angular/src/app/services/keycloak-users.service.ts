import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { keyCloakUser } from './../utils/app-init';

@Injectable()
export class KeycloakUsersService {

  API = environment.apiUrl;
  USER_ROLES_API = `${this.API}/user`;
  authorizedUser: boolean;

  constructor(private http: HttpClient) { }

  public retrieveRolesAssociatedWithUser(username: string) {
    return this.http.get(
      `${this.USER_ROLES_API}/retrieveRolesAssociatedWithUser/${username}`).toPromise();
  }

  public retrieveAllRoles() {
    return this.http.get(
      `${this.USER_ROLES_API}/retrieveAllRoles`);
  }

  public updateRoles(roleDetailsToEdit: Object) {
    const requestBody = {
      roleDetails: roleDetailsToEdit,
      username: keyCloakUser.getUsername(),
    };
    return this.http.put(
      `${this.USER_ROLES_API}/updateRoles`, requestBody);
  }

  public checkUserPermissions(): boolean {
    if (this.authorizedUser === undefined) {
      this.authorizedUser = keyCloakUser.isUserInRole('OPS');
    }
    return this.authorizedUser;
  }

}
