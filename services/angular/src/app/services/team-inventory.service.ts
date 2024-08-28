import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

@Injectable()
export class TeamInventoryService {
  API = environment.apiUrl;
  TEAM_INVENTORY_BACKUP_URL = `${this.API}/team-inventory-tool-backup`;
  TEAM_INVENTORY_URL =
    'https://jira-api.seli.wh.rnd.internal.ericsson.com/jira-api/rest/team-emails';

  constructor(
    private http: HttpClient,
  ) { }

  public getTeamsInfoFromTeamInventoryTool(): Observable<Object> {
    return this.http.get(this.TEAM_INVENTORY_URL);
  }

  public getTeamsInfoFromDatabase(): Observable<Object> {
    console.log('WARNING : Team Inventory Tool is not reachable, using local backup!');
    return this.http.get(this.TEAM_INVENTORY_BACKUP_URL);
  }
}
