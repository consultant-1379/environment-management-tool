import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { Subscription } from 'rxjs';
import { EventsService } from './../services/event.service';
import { DeploymentService } from '../services/deployments.service';
import { DeploymentSessionService } from '../services/deployment-session.service';
import { Deployment } from '../models/deployment';
import { Session } from '../models/session';
import { ConfirmRemoveEnvironmentComponent } from './confirm-remove-environment.component';
import { EnvironmentAlertsComponent } from './environment-alerts.component';
import { AddEnvironmentComponent } from './add-environment.component';
import { EditEnvironmentComponent } from './edit-environment.component';
import { RoutingSessionService } from '../services/routing.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { keyCloakUser } from './../utils/app-init';
import { Logger } from './../services/logging.service';

@Component({
  selector: 'admin-environment',
  templateUrl: './admin-environment.component.html',
  styleUrls: ['./admin-environment.component.css'],
})

export class AdminEnvironmentComponent implements OnInit {

  private givenEnvironment: string = '';
  private environments: Deployment[] = [];
  private environment: Deployment;
  private navigationEndEventSubscription: Subscription;
  private enterEnvironmentForm: FormGroup;
  private environmentNameControl: AbstractControl;

  constructor(
    private eventsService: EventsService,
    private deploymentService: DeploymentService,
    private deploymentSessionService: DeploymentSessionService,
    private dialog: MatDialog,
    private routingSessionService: RoutingSessionService,
    private snackBar: MatSnackBar,
    private router: Router,
    private formBuilder: FormBuilder,
    private angularLogger: Logger,
  ) { }

  ngOnInit() {
    this.eventsService.sendMessage('hideTestPhases');
    this.navigationEndEventSubscription = this.routingSessionService.enablePageRefresh();
    this.enterEnvironmentForm = this.formBuilder.group({
      environmentNameControl: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9-_]+$'),
      ])),
    });
    this.environmentNameControl = this.enterEnvironmentForm.get('environmentNameControl');
  }

  private async removeEnvironment(): Promise<void> {
    const environmentExists = await this.checkIfEnvironmentExists();
    if (environmentExists) {
      const listOfActiveSessionsOnEnvironment: Session[] =
        await this.deploymentSessionService.checkSessionsOnDeployment(this.environment._id);
      if ((this.environment.state !== 'BUSY') && (listOfActiveSessionsOnEnvironment.length === 0)) {
        const dialogRef = this.dialog.open(ConfirmRemoveEnvironmentComponent, {
          data: {
            environmentToRemove: this.givenEnvironment,
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'confirm') {
            const keycloakUsername = keyCloakUser.getUsername();
            this.deploymentService.removeEnvironment(this.environment);
            dialogRef.afterClosed().toPromise();
            const additionalTags = {
              afterRemove: this.environment,
              signum: keycloakUsername,
              environment: this.environment.name,
            };
            const message = `Environment ${this.environment.name} has been removed by ${keycloakUsername}`;
            this.angularLogger.info(message, additionalTags);
            this.openSnackBar(`Environment Removed: ${this.environment.name}`);
            this.router.navigate(['/environments']);
          } else {
            dialogRef.close();
          }
        });
      } else {
        const dialogRef = this.dialog.open(EnvironmentAlertsComponent, {
          data: {
            message: `Unable to edit environment ${this.givenEnvironment} as it
            may be in busy state or have an active session`,
          },
        });
      }
    } else {
      const dialogRef = this.dialog.open(EnvironmentAlertsComponent, {
        data: {
          message: `Environment ${this.givenEnvironment} does not exist in EMT`,
        },
      });
    }
    this.givenEnvironment = '';
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: 'custom-snackbar-class',
    });
  }

  openErrorSnackBar(message: string): void {
    this.snackBar.open(message, '', {
      duration: 7000,
      panelClass: 'error-snackbar-class',
    });
  }

  private async editEnvironment(): Promise<void> {
    const environmentExists = await this.checkIfEnvironmentExists();
    if (environmentExists) {
      this.dialog.open(EditEnvironmentComponent, {
        width: '540px',
        data: {
          environmentToEditName: this.givenEnvironment,
        },
      });
    } else {
      const dialogRef = this.dialog.open(EnvironmentAlertsComponent, {
        data: {
          message: `Environment ${this.givenEnvironment} does not exist in EMT`,
        },
      });
    }
    this.givenEnvironment = '';
  }
  private async addEnvironment(): Promise<void> {
    const environmentExists = await this.checkIfEnvironmentExists();
    if (!environmentExists) {
      this.dialog.open(AddEnvironmentComponent, {
        width: '540px',
        data: {
          environmentNameToAdd: this.givenEnvironment,
        },
      });
    } else {
      const dialogRef = this.dialog.open(EnvironmentAlertsComponent, {
        data: {
          message: `Environment ${this.givenEnvironment} already exists in EMT`,
        },
      });
    }
    this.givenEnvironment = '';
  }

  private async checkIfEnvironmentExists(): Promise<Boolean> {
    const environment = await this.deploymentService.getEnvironmentByName(this.givenEnvironment);
    if (environment[0] !== undefined) {
      this.environment = environment[0];
      return true;
    }
    return false;
  }

  ngOnDestroy(): void {
    if (this.navigationEndEventSubscription) {
      this.navigationEndEventSubscription.unsubscribe();
    }
  }
}
