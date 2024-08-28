import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../environments/environment';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

import { Deployment } from '../../models/deployment';
import { DeploymentService } from '../../services/deployments.service';
import { DmtService } from '../../services/dmt.service';
import { Session } from '../../models/session';
import { keyCloakUser } from './../../utils/app-init';
import { Logger } from './../../services/logging.service';
import { JenkinsService } from './../../services/jenkins.service';
import { ConfirmAutoTriggerSHC } from './confirm-autotriggershc.component';

@Component({
  selector: 'deployment-actions',
  templateUrl: './deployment-actions.component.html',
  styleUrls: ['./deployment-actions.component.css'],
})
export class DeploymentActionsComponent implements OnInit {

  @Input() deploymentInfo: Deployment;
  @Input() checkUserPermissions: boolean;

  API = environment.apiUrl;
  KIBANA_HOST = environment.kibanaHost;
  sessions: Session[] = [];
  keycloakUsername: String = keyCloakUser.getUsername();

  constructor(
    private deploymentService: DeploymentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dmtService: DmtService,
    private jenkinsService: JenkinsService,
    private angularLogger: Logger,
  ) { }

  ngOnInit() {
  }

  isSystemHealthCheckRequired(deployment: Deployment): boolean {
    return this.isDeploymentAction(deployment.systemHealthCheckStatus, 'REQUIRED');
  }

  isShcRequired(deployment: Deployment): boolean {
    return this.isDeploymentAction(deployment.systemHealthCheckStatus, 'REQUIRED');
  }

  isShcCompleted(deployment: Deployment): boolean {
    return this.isDeploymentAction(deployment.systemHealthCheckStatus, 'COMPLETED');
  }

  isAutoShcRequired(deployment: Deployment): boolean {
    return this.isDeploymentAction(deployment.systemHealthCheckStatus, 'START_AUTO_SHC');
  }

  isShcAttentionRequired(deployment: Deployment): boolean {
    return this.isDeploymentAction(deployment.systemHealthCheckStatus, 'ATTENTION');
  }

  isShcStatusNull(deployment: Deployment): boolean {
    return this.isDeploymentAction(deployment.systemHealthCheckStatus, ' ');
  }

  isSystemHealthStatusNotPresent(deployment: Deployment) {
    const isShcRequired: boolean =
      this.isDeploymentAction(deployment.systemHealthCheckStatus, 'REQUIRED');
    const isShcCompleted: boolean =
      this.isDeploymentAction(deployment.systemHealthCheckStatus, 'COMPLETED');
    const isAutoShcRequired: boolean =
      this.isDeploymentAction(deployment.systemHealthCheckStatus, 'START_AUTO_SHC');
    const isShcAttentionRequired: boolean =
      this.isDeploymentAction(deployment.systemHealthCheckStatus, 'ATTENTION');
    const isShcStatusNull: boolean =
      this.isDeploymentAction(deployment.systemHealthCheckStatus, ' ');
    if (isShcRequired || isShcCompleted || isAutoShcRequired || isShcAttentionRequired || isShcStatusNull) {
      return false;
    }
    return true;
  }

  isMarkedForII(deployment: Deployment): boolean {
    return this.isDeploymentAction(deployment.deploymentRefreshStatus, 'STALE');
  }

  isMarkedForUpgrade(deployment: Deployment): boolean {
    return this.isDeploymentAction(deployment.deploymentUpgradeStatus, 'REQUIRED');
  }

  isMarkedForRollback(deployment: Deployment): boolean {
    return this.isDeploymentAction(deployment.deploymentRollbackStatus, 'REQUIRED');
  }

  changeShcStatus(deployment: Deployment, shcStatus: string): void {
    deployment.systemHealthCheckStatus = shcStatus;
    this.deploymentService.updateDeployment(deployment).subscribe((deployment) => {
      const additionalTags = {
        signum: this.keycloakUsername,
        environment: deployment.name,
      };
      this.deploymentInfo = deployment;
      if (deployment.systemHealthCheckStatus === shcStatus) {
        if (shcStatus !== ' ') {
          if (shcStatus === 'START_AUTO_SHC') {
            if (deployment.testPhase === 'MTE' || deployment.testPhase === 'RTD') {
              this.openConfirmAutoShcEditModel(deployment);
              const message = `Updated SHC status for ${deployment.name} to ${shcStatus} by ${this.keycloakUsername}`;
              this.angularLogger.info(message, additionalTags);
            } else {
              this.openSnackBar(`Cannot Trigger Auto SHC for ${deployment.name} for ${deployment.testPhase}`);
              deployment.systemHealthCheckStatus = ' ';
              this.deploymentService.updateDeployment(deployment).subscribe((deployment) => {
                const additionalTags = {
                  signum: this.keycloakUsername,
                  environment: deployment.name,
                };
                this.deploymentInfo = deployment;
              });
            }
          } else {
            const message = `Updated SHC status for ${deployment.name} to ${shcStatus} by ${this.keycloakUsername}`;
            this.angularLogger.info(message, additionalTags);
            this.openSnackBar(`Updated SHC status for ${deployment.name} to ${shcStatus}`);
          }
        } else {
          const message = `Cleared SHC status for ${deployment.name} by ${this.keycloakUsername}`;
          this.angularLogger.info(message, additionalTags);
          this.openSnackBar(`Cleared SHC status for ${deployment.name}`);
        }
      } else {
        this.openSnackBar(`ERROR: Failed updating SHC status for
        ${deployment.name} to ${shcStatus}`);
      }
    });
  }

  private async openConfirmAutoShcEditModel(deployment: Deployment): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmAutoTriggerSHC, {
      data: {
        environmentName: deployment.name,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        const keycloakUsername = keyCloakUser.getUsername();
        console.log('Just a test');
        deployment.systemHealthCheckStatus = 'START_AUTO_SHC';
        this.deploymentService.updateDeployment(deployment).subscribe((deployment) => {
          const additionalTags = {
            signum: this.keycloakUsername,
            environment: deployment.name,
          };
          this.deploymentInfo = deployment;
        });
        this.triggerJenkinsSHCJob(deployment);
        this.openSnackBar(`Updated SHC status for ${deployment.name} to AUTO SHC STARTED`);
      } else {
        dialogRef.close();
        deployment.systemHealthCheckStatus = ' ';
        this.deploymentService.updateDeployment(deployment).subscribe((deployment) => {
          const additionalTags = {
            signum: this.keycloakUsername,
            environment: deployment.name,
          };
          this.deploymentInfo = deployment;
        });
      }
    });
  }

  async triggerJenkinsSHCJob(deployment: Deployment) {
    console.log('Going to trigger jenkins');
    console.log('Going to trigger jenkins SHC job');
    await this.jenkinsService.triggerJenkinsJob(deployment.name, deployment.platformType);
  }

  changeIIStatus(deployment: Deployment, iiStatus: string): void {
    deployment.deploymentRefreshStatus = iiStatus;
    this.deploymentService.updateDeployment(deployment).subscribe((deployment) => {
      this.deploymentInfo = deployment;
      if (deployment.deploymentRefreshStatus === iiStatus) {
        const additionalTags = {
          signum: this.keycloakUsername,
          environment: deployment.name,
        };
        const message = `Updated II status for ${deployment.name} to ${iiStatus} by ${this.keycloakUsername}`;
        this.angularLogger.info(message, additionalTags);
        this.openSnackBar(`Updated II status for ${deployment.name} to ${iiStatus}`);
      } else {
        this.openSnackBar(`ERROR: Failed updating II status for ${deployment.name} to ${iiStatus}`);
      }
    });
  }

  changeUpgradeStatus(deployment: Deployment, ugStatus: string): void {
    deployment.deploymentUpgradeStatus = ugStatus;
    this.deploymentService.updateDeployment(deployment).subscribe((deployment) => {
      this.deploymentInfo = deployment;
      if (deployment.deploymentUpgradeStatus === ugStatus) {
        const additionalTags = {
          signum: this.keycloakUsername,
          environment: deployment.name,
        };
        const message = `Updated UG status for ${deployment.name} to ${ugStatus} by ${this.keycloakUsername}`;
        this.angularLogger.info(message, additionalTags);
        this.openSnackBar(`Updated UG status for ${deployment.name} to ${ugStatus}`);
      } else {
        this.openSnackBar(`ERROR: Failed updating UG status for ${deployment.name} to ${ugStatus}`);
      }
    });
  }

  changeRollbackStatus(deployment: Deployment, rollbackStatus: string): void {
    deployment.deploymentRollbackStatus = rollbackStatus;
    this.deploymentService.updateDeployment(deployment).subscribe((deployment) => {
      this.deploymentInfo = deployment;
      if (deployment.deploymentRollbackStatus === rollbackStatus) {
        const additionalTags = {
          signum: this.keycloakUsername,
          environment: deployment.name,
        };
        const message =
          `Updated Rollback status for ${deployment.name} to ${rollbackStatus} by ${this.keycloakUsername}`;
        this.angularLogger.info(message, additionalTags);
        this.openSnackBar(`Updated Rollback status for ${deployment.name} to ${rollbackStatus}`);
      } else {
        this.openSnackBar(`ERROR: Failed updating Rollback status for
        ${deployment.name} to ${rollbackStatus}`);
      }
    });
  }

  isSystemHealthCompletedOrRequired(deployment: Deployment) {
    const isDeploymentShcCompleted: boolean =
      this.isDeploymentAction(deployment.systemHealthCheckStatus, 'COMPLETED');
    const isDeploymentShcRequired: boolean =
      this.isDeploymentAction(deployment.systemHealthCheckStatus, 'REQUIRED');
    if (isDeploymentShcCompleted || isDeploymentShcRequired) {
      return true;
    }
    return false;
  }

  private isDeploymentAction(deploymentAction: string, wantedDeploymentAction: string): boolean {
    if (deploymentAction === wantedDeploymentAction) {
      return true;
    }
    return false;
  }

  private openSnackBar(message: string) {
    this.displaySnackbar(message, 5000, 'custom-snackbar-class');
  }

  private displaySnackbar(message: string, snackbarDuration: number, snackbarPanelClass: string) {
    this.snackBar.open(message, '', {
      duration: snackbarDuration,
      panelClass: snackbarPanelClass,
    });
  }

  private changeState(deployment: Deployment): void {
    const updatedDeployment: Deployment = new Deployment;
    updatedDeployment.name = deployment.name;
    updatedDeployment._id = deployment._id;
    if (deployment.state === 'QUARANTINE' && deployment.isSessionCreated === true) {
      const errorMessage = 'Deployment state cannot be changed while Session is active';
      this.displaySnackbar(errorMessage, 5000, 'error-snackbar-class');
    } else if (deployment.state === 'IDLE') {
      updatedDeployment.state = 'QUARANTINE';
      const additionalTags = {
        signum: this.keycloakUsername,
        environment: deployment.name,
      };
      const message = `Moved ${deployment.name} into ${updatedDeployment.state} state by ${this.keycloakUsername}`;
      this.angularLogger.info(message, additionalTags);
      this.openSnackBar(`Moved ${deployment.name} into ${updatedDeployment.state} state`);
    } else {
      updatedDeployment.state = 'IDLE';
      updatedDeployment.jobName = ' ';
      updatedDeployment.assignedJob = ' ';
      const additionalTags = {
        signum: this.keycloakUsername,
        environment: deployment.name,
      };
      const message = `Moved ${deployment.name} into ${updatedDeployment.state} state by ${this.keycloakUsername}`;
      this.angularLogger.info(message, additionalTags);
      this.openSnackBar(`Moved ${deployment.name} into ${updatedDeployment.state} state`);
    }

    this.deploymentService.updateDeployment(updatedDeployment).subscribe();
  }

  private openEnvironmentLogs(environment: Deployment): void {
    const blankWindow = window.open('', '_blank');
    const envLogInKibana = `${this.KIBANA_HOST}/s/operations/app/kibana#/dashboard/` +
      'ThunderbeeKibanaDashboard?_g=(filters:!(),refreshInterval:(pause:!t,value:0)' +
      ',time:(from:now-15d,to:now))&_a=(description:\'\',filters:!((\'$state\':(store:appState)' +
      ',meta:(alias:!n,controlledBy:\'ThunderbeeKibanaController\',disabled:!f,index:' +
      '\'ThunderbeeKibanaDataSource\',key:environment.keyword,negate:!f,params:' +
      '(query:\'' + `${environment.name}` + '\'),type:phrase,value:\'' + `${environment.name}` +
      '\'),query:(match:(environment.keyword:(query:\'' + `${environment.name}` + '\',' +
      'type:phrase))))))';
    blankWindow.location.href = envLogInKibana;
  }
}
