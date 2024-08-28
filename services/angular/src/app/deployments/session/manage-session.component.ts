import { Component, Input } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { ManageButtonComponent } from './manage-button.component';
import { Deployment } from '../../models/deployment';
import { DeploymentSessionService } from '../../services/deployment-session.service';
import { SessionService } from '../../quarantine-management/session.service';
import { RoutingSessionService } from '../../services/routing.service';
import { Session } from '../../models/session';
import { Subscription } from 'rxjs';

@Component({
  selector: 'manage-session',
  styleUrls: ['./manage-session.component.css'],
  template: `
  <button mat-menu-item (click)="openManageSessionForm();">
    <mat-icon>group_add</mat-icon>
    Manage Session
  </button>
`,
})

export class ManageSessionButtonComponent {

  @Input() deploymentInfo: Deployment;
  @Input() session: Session;
  @Input() jiras: String[];
  navigationEndEventSubscription: Subscription;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private deploymentSessionService: DeploymentSessionService,
    private routingSessionService: RoutingSessionService,
    public sessionService: SessionService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.navigationEndEventSubscription = this.routingSessionService.enablePageRefresh();
  }

  ngOnDestroy() {
    if (this.navigationEndEventSubscription) {
      this.navigationEndEventSubscription.unsubscribe();
    }
  }

  openErrorSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 7000,
      panelClass: 'error-snackbar-class',
    });
  }

  async openManageSessionForm() {
    await this.retrieveSessionId();
    this.jiras = this.session[0].jira;
    const dialogRef = this.dialog.open(ManageButtonComponent, {
      width: '35%',
      disableClose: true,
      data: {
        deployment: this.deploymentInfo,
        deploymentTestPhase: this.deploymentInfo.testPhase,
        platformType: this.deploymentInfo.platformType,
        session: this.session[0],
        jiras: this.jiras,
      },
    });
  }

  private async retrieveSessionId() {
    const listOfActiveSessionsOnDeployment : Session[] =
    await this.deploymentSessionService.checkSessionsOnDeployment(this.deploymentInfo._id);
    if (listOfActiveSessionsOnDeployment.length === 0) {
      this.openErrorSnackBar(`ERROR: Session does not exist for ${this.deploymentInfo.name}`);
      this.router.navigateByUrl('deployments');
    } else {
      this.session = await this.sessionService.
      getActiveSessionFromDeploymentId(this.deploymentInfo._id);
    }
  }
}
