import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Deployment } from '../models/deployment';
import { DeploymentService } from '../services/deployments.service';
import { Router } from '@angular/router';
import { TestPhases } from '../systemPanel/testPhases';
import { AdminEnvironmentService } from '../services/admin-environment.service';
import { ConfirmEditEnvironmentComponent } from './confirm-edit-environment.component';
import { EnvironmentAlertsComponent } from './environment-alerts.component';
import { keyCloakUser } from './../utils/app-init';
import { Logger } from './../services/logging.service';

@Component({
  selector: 'edit-environment',
  templateUrl: './edit-environment.component.html',
  styleUrls: ['./edit-environment.component.css'],
})

export class EditEnvironmentComponent implements OnInit {

  private environmentToEdit: Deployment = new Deployment();
  private environmentName: string;
  private plaformTypeBeforeEdit: String;
  private navigationEndEventSubscription: Subscription;
  private editEnvironmentForm: FormGroup;
  private restrictedMode: Boolean = false;
  private testPhases: string[] = [];
  private deploymentTypes: string[] = ['FUNCTIONAL', 'NON-FUNCTIONAL', 'FUNCTIONAL/NON-FUNCTIONAL'];
  private platformTypes: string[] = ['physical', 'vENM', 'SIENM', 'cENM'];
  ddpSites: string[] = ['ddpenm1', 'ddpenm2', 'ddpenm3', 'ddpenm4', 'ddpenm5', 'ddpenm6', 'ddpenm7', 'ddpi'];
  environmentPropertiesToCheckIfEmpty = {
    common: ['nrmVersion', 'nrmSize', 'nssProductSetVersion', 'pod', 'workloadVm', 'nodeTypes', 'nodeVersions', 'ddp'],
    physical: ['blades', 'freeIp', 'vFarms', 'firmware', 'sanHost',
      'sanShared', 'nasHost', 'nasShared', 'nasSoftware', 'hardwareType'],
    vENM: ['openstackVersion', 'externalNfs'],
    SIENM: ['openstackVersion', 'externalNfs'],
    cENM: ['openstackVersion', 'externalNfs', 'ccdVersion', 'nameSpace', 'clusterNodes'],
  };

  constructor(
    public dialogRef: MatDialogRef<EditEnvironmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private adminService: AdminEnvironmentService,
    private deploymentService: DeploymentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private angularLogger: Logger,
  ) { }

  ngOnInit() {
    this.testPhases = Object.values(TestPhases).filter(x => typeof x === 'string');
    this.getDeploymentInfo();
    this.setUpEnvironmentForm();
  }

  private setUpEnvironmentForm(): void {
    this.editEnvironmentForm = this.formBuilder.group({
      name: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9-_]+$'),
      ])),
      testPhase: new FormControl('', Validators.required),
      productSet: new FormControl('', Validators.compose([
        Validators.pattern('^([0-9]{1,2})[.]([0-9]{1,2})[.]([0-9]{1,3})[-]([0-9]{1,2})$'),
      ])),
      nssProductSetVersion: new FormControl('', Validators.compose([
        Validators.pattern('^([0-9]{1,2})[.]([0-9]{1,2})[.]([0-9]{1,3})$'),
      ])),
      deploymentType: new FormControl('', Validators.required),
      platformType: new FormControl('', Validators.required),
    });
  }

  private async getDeploymentInfo(): Promise<void> {
    this.environmentName = this.data['environmentToEditName'];
    await this.deploymentService.getEnvironmentByName(this.environmentName)
      .then((environment) => {
        this.environmentToEdit = environment[0];
      });
    this.plaformTypeBeforeEdit = this.environmentToEdit['platformType'];
    this.updateEnvironmentPropertiesIfWhiteSpace();
    this.toggleRestrictedMode(this.environmentToEdit);
  }

  private toggleRestrictedMode(environment: Deployment): void {
    if (environment.state === 'BUSY' || environment.isSessionCreated) {
      this.editEnvironmentForm.controls['name'].disable();
      this.editEnvironmentForm.controls['testPhase'].disable();
      this.editEnvironmentForm.controls['productSet'].disable();
      this.editEnvironmentForm.controls['deploymentType'].disable();
      this.editEnvironmentForm.controls['platformType'].disable();
      this.restrictedMode = true;
    }
  }

  private updateEnvironmentPropertiesIfWhiteSpace(): void {
    for (const key in this.environmentPropertiesToCheckIfEmpty) {
      this.environmentPropertiesToCheckIfEmpty[key].forEach((property) => {
        if (this.environmentToEdit[property] === ' ') {
          this.removeWhiteSpace(property);
        }
      });
    }
  }

  closeDialogModal(): void {
    this.dialogRef.close();
  }

  private openSnackBar(message: string, time: number, panelClassSelector: string): void {
    this.snackBar.open(message, '', {
      duration: time,
      panelClass: panelClassSelector,
    });
  }

  private updateEnvironmentPropertiesIfEmpty(): void {
    this.environmentPropertiesToCheckIfEmpty['common'].forEach((property) => {
      this.checkIsPropertyEmpty(property);
    });
    this.environmentPropertiesToCheckIfEmpty[this.environmentToEdit['platformType']].forEach((property) => {
      this.checkIsPropertyEmpty(property);
    });
    if (this.environmentToEdit['platformType'] !== this.plaformTypeBeforeEdit) {
      if (this.platformTypes.includes(this.plaformTypeBeforeEdit.toString())) {
        this.environmentPropertiesToCheckIfEmpty[this.plaformTypeBeforeEdit.toString()].forEach((property) => {
          this.setPropertyToEmpty(property);
        });
      }
    }
  }

  private removeWhiteSpace(property: string): void {
    this.environmentToEdit[property] = '';
  }

  private setPropertyToEmpty(property: string): void {
    this.environmentToEdit[property] = ' ';
  }

  private checkIsPropertyEmpty(property: string): void {
    if (!this.environmentToEdit[property]) {
      this.environmentToEdit[property] = ' ';
    }
  }

  private async editEnvironment(): Promise<void> {
    const environmentExists
      = await this.adminService.checkIfEnvironmentExists(this.environmentName);
    if (environmentExists) {
      const previousRestrictedModeState = this.restrictedMode;
      await this.deploymentService.getEnvironmentByName(this.environmentName)
        .then((environment) => {
          this.toggleRestrictedMode(environment[0]);
        });
      if (previousRestrictedModeState || this.restrictedMode === previousRestrictedModeState) {
        if (await this.checkIfEditedNameIsValid()) {
          this.openConfirmEditModel();
        } else {
          const dialogRef = this.dialog.open(EnvironmentAlertsComponent, {
            data: {
              message: `The environment name ${this.environmentToEdit.name}
                 already belongs to an existing environment.`,
            },
          });
        }
      } else {
        this.openSnackBar(
          `Unable to edit environment ${this.environmentName} as it
          may be in busy state or have an active session`,
          7000, 'error-snackbar-class');
        this.closeDialogModal();
      }
    } else {
      this.openSnackBar(
        `ERROR: Environment ${this.environmentName}
        no longer exists in EMT`,
        7000, 'error-snackbar-class');
      this.closeDialogModal();
    }
  }

  private async checkIfEditedNameIsValid(): Promise<boolean> {
    if (this.environmentName === this.environmentToEdit.name) {
      return true;
    }
    const environmentExists = await this.adminService.
      checkIfEnvironmentExists(this.environmentToEdit.name);
    if (environmentExists) {
      return false;
    }
    return true;
  }

  private async openConfirmEditModel(): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmEditEnvironmentComponent, {
      data: {
        environmentToEditName: this.environmentName,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        const keycloakUsername = keyCloakUser.getUsername();
        this.updateEnvironmentPropertiesIfEmpty();
        this.deploymentService.updateDeployment(this.environmentToEdit)
          .subscribe((environmentToEdit) => {
            const additionalTags = {
              afterUpdate: environmentToEdit,
              signum: keycloakUsername,
              environment: this.environmentName,
            };
            const message = `Environment ${this.environmentName} has been edited by ${keycloakUsername}`;
            this.angularLogger.info(message, additionalTags);
            this.openSnackBar(
              `Environment ${this.environmentName} has been edited successfully.`,
              5000, 'custom-snackbar-class');
            this.closeDialogModal();
            dialogRef.afterClosed().toPromise();
            this.router.navigate(['/environments']);
          });
      } else {
        dialogRef.close();
      }
    });
  }
}
