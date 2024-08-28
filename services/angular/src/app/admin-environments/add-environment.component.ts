import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Deployment } from '../models/deployment';
import { DeploymentService } from '../services/deployments.service';
import { DeploymentSessionService } from '../services/deployment-session.service';
import { RoutingSessionService } from '../services/routing.service';
import { Router } from '@angular/router';
import { TestPhases } from '../systemPanel/testPhases';
import { AdminEnvironmentService } from '../services/admin-environment.service';
import { keyCloakUser } from './../utils/app-init';
import { Logger } from './../services/logging.service';

@Component({
  selector: 'add-environment',
  templateUrl: './add-environment.component.html',
  styleUrls: ['./add-environment.component.css'],
})

export class AddEnvironmentComponent implements OnInit {

  private environmentToAdd: Deployment = new Deployment();
  private navigationEndEventSubscription: Subscription;
  private deployments: Deployment[] = [];
  private addEnvironmentForm: FormGroup;
  private selectedTestPhase: string = '';
  private selectedEnvironmentType: string = '';
  private selectedPlatformType: string = '';
  private testPhases: string[] = [];
  private deploymentTypes: string[] = ['FUNCTIONAL', 'NON-FUNCTIONAL', 'FUNCTIONAL/NON-FUNCTIONAL'];
  private platformTypes: string[] = ['physical', 'vENM', 'SIENM', 'cENM'];
  private ddpSites: string[] = ['ddpenm1', 'ddpenm2', 'ddpenm3',
    'ddpenm4', 'ddpenm5', 'ddpenm6', 'ddpenm7', 'ddpi'];
  private enmPsPattern: string = '^([0-9]{1,2})[.]([0-9]{1,2})[.]([0-9]{1,3})$';
  private cenmPsPattern: string =
        '^([0-9]{1,2})[.]([0-9]{1,2})[.]([0-9]{1,3})[-]([0-9]{1})$';

  constructor(
    public dialogRef: MatDialogRef<AddEnvironmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private deploymentService: DeploymentService,
    private deploymentSessionService: DeploymentSessionService,
    private routingSessionService: RoutingSessionService,
    private adminService: AdminEnvironmentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private angularLogger: Logger,
  ) { }

  ngOnInit() {
    this.navigationEndEventSubscription = this.routingSessionService.enablePageRefresh();
    this.testPhases = Object.values(TestPhases).filter(x => typeof x === 'string');
    this.addEnvironmentForm = this.formBuilder.group(
      {
        testPhase: new FormControl('', Validators.required),
        environmentType: new FormControl('', Validators.required),
        platformType: new FormControl('', Validators.required),
        productSet: new FormControl('', Validators.compose([
          Validators.pattern(`(${this.enmPsPattern})|(${this.cenmPsPattern})`),
        ])),
        nssProductSetVersion: new FormControl('', Validators.compose([
          Validators.pattern('^([0-9]{1,2})[.]([0-9]{1,2})[.]([0-9]{1,3})$'),
        ])),
      },
    );
  }

  ngOnDestroy(): void {
    if (this.navigationEndEventSubscription) {
      this.navigationEndEventSubscription.unsubscribe();
    }
  }

  closeDialogModal(): void {
    this.dialogRef.close();
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

  private async addEnvironment(): Promise<void> {
    this.environmentToAdd.name = this.data.environmentNameToAdd;
    await this.deploymentService.addEnvironment(this.environmentToAdd);
    if (this.adminService.checkIfEnvironmentExists(this.data.environmentNameToAdd)) {
      const keyCloakUsername = keyCloakUser.getUsername();
      const additionalTags = {
        newEnvironment: this.environmentToAdd,
        signum: keyCloakUsername,
        environment: this.data.environmentNameToAdd,
      };
      const message = `Environment ${this.data.environmentNameToAdd} added by ${keyCloakUsername}`;
      this.angularLogger.info(message, additionalTags);
      this.openSnackBar(`Environment Added: ${this.data.environmentNameToAdd}`);
      this.closeDialogModal();
      this.router.navigate(['/environments']);
    } else {
      this.openErrorSnackBar(
        `ERROR: Failed to add the Environment ${this.data.environmentNameToAdd}`);
      this.closeDialogModal();
    }
  }
}
