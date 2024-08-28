import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Session } from '../../models/session';
import { SessionService } from '../session.service';
import { EventsService } from './../../services/event.service';
import { KeycloakUsersService } from './../../services/keycloak-users.service';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css'],
})
export class SessionComponent implements OnInit {

  private sessionType: string;
  private allSessions: Session[];
  private sessionsToDisplay: Session[];
  private states = ['active', 'expired', 'all'];
  private sessionSource: MatTableDataSource<Session>;
  private userIsOps: boolean = false;
  @ViewChild(MatSort) sessionSort: MatSort;
  @Input() endTimeSortDirection: string = 'asc';

  constructor(
    private sessionService: SessionService,
    private eventsService: EventsService,
    private keycloakUsersService: KeycloakUsersService,
  ) {
    this.sessionSource = new MatTableDataSource([]);
  }

  ngOnInit(): void {
    this.getSessions('active');
    this.eventsService.sendMessage('hideTestPhases');
    this.userIsOps = this.keycloakUsersService.checkUserPermissions();
  }

  sessionTableColumns: string[]
    = ['deploymentName', 'assignedTeam', 'assignedUserNames', 'jira', 'username', 'status',
      'sessionUserCredentials', 'startTime', 'endTime'];

  async getSessions(theSessionType) {
    this.sessionType = theSessionType;
    this.allSessions = await this.getAllSessions();
    await this.filterSessions();
    this.sessionSource.data = this.sessionsToDisplay;
  }

  getAllSessions(): Promise<Session[]> {
    return this.sessionService.getAllSessions();
  }

  filterSessions(): void {
    if (this.sessionType !== 'all') {
      this.sessionsToDisplay = this.sessionService.
        filterSessionsByStatus(this.allSessions, this.sessionType);
    } else {
      this.sessionsToDisplay = this.allSessions;
    }
    this.changeSortDirectionOfTable(this.sessionType);
  }

  private changeSortDirectionOfTable(sessionType: string): void {
    if (sessionType === 'active') {
      this.endTimeSortDirection = 'asc';
      this.sessionSort.direction = 'asc';
    } else {
      this.endTimeSortDirection = 'desc';
      this.sessionSort.direction = 'desc';
    }
    this.sessionSource.sort = this.sessionSort;
  }

  ngAfterViewInit() {
    this.sessionSource.sort = this.sessionSort;
  }
}
