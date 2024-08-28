import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatCheckboxChange } from '@angular/material';
import { KeycloakUsersService } from '../services/keycloak-users.service';
import { PhasesCheckbox } from '../systemPanel/phasesCheckbox';
import { PlatformTypesCheckbox } from '../systemPanel/platformTypesCheckbox';
import { PlatformTypesToCheckboxMapping } from '../systemPanel/platformTypesToCheckboxMapping';
import { PhasesToCheckboxMapping } from '../systemPanel/phasesToCheckboxMapping';
import { Router } from '@angular/router';
import { keyCloakUser } from './../utils/app-init';
import { Logger } from './../services/logging.service';

@Component({
  selector: 'update-roles',
  templateUrl: './update-roles.component.html',
  styleUrls: ['./update-roles.component.css'],
})

export class UpdateRolesComponent implements OnInit {
  private MT_ENTRY_PHASES: string[] = ['MTE'];
  private MT_VALIDATION_PHASES: string[] = [
    'CDL', 'LongLoop', 'RVB', 'STKPI', 'RNL',
  ];
  private SPRINT_RELEASE_PHASES: string[] = [
    'DROPBACK', 'PLM', 'ENDURANCE', 'SprintValidation',
  ];
  private OTHER_PHASES: string[] = ['TEaaS', 'RTD', 'CS'];
  private SUPPORTED_TEST_PHASES: string[] =
    this.MT_ENTRY_PHASES.concat(
      this.MT_VALIDATION_PHASES, this.SPRINT_RELEASE_PHASES, this.OTHER_PHASES,
    );
  private PLATFORM_TYPES: string[] = ['physical', 'vENM', 'SIENM', 'cENM'];

  private selectedTestPhases: string[] = [];
  private listOfRolesAssignedToUser: string[] = [];
  private selectedPlatformTypes: string[] = [];
  private phasesCheckbox: PhasesCheckbox;
  private platformTypesCheckbox : PlatformTypesCheckbox;
  private loader = false;

  private rolesToAdd: any[] = [];
  private rolesToRemove: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public router: Router,
    public dialogRef: MatDialogRef<UpdateRolesComponent>,
    private snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef,
    private userService: KeycloakUsersService,
    private angularLogger: Logger,
  ) { }

  ngOnInit() {
    this.phasesCheckbox = new PhasesCheckbox();
    this.platformTypesCheckbox = new PlatformTypesCheckbox();
    this.changeDetector.detectChanges();
    this.filterThroughRoleInformation();
    this.enableDisableSpecifiedTestPhases(this.listOfRolesAssignedToUser, 'enable');
    this.enableDisableSpecifiedPlatformTypes(this.listOfRolesAssignedToUser, 'enable');
  }

  private filterThroughRoleInformation(): void {
    this.data.userInformation['roles'].forEach((role) => {
      this.listOfRolesAssignedToUser.push(role['name']);
    });
  }

  private getUserRolesToChangeInKeycloak(): void {
    this.rolesToAdd = [];
    this.rolesToRemove = [];
    let opsRoleId = '';
    this.data.allRoles.forEach((role) => {
      if (this.SUPPORTED_TEST_PHASES.indexOf(role['name']) !== -1) {
        if (this.selectedTestPhases.includes(role['name'])) {
          this.rolesToAdd.push({
            id: role['id'],
            name: role['name'],
          });
        } else {
          this.rolesToRemove.push({
            id: role['id'],
            name: role['name'],
          });
        }
      } else if (role['name'] === 'OPS') {
        opsRoleId = role['id'];
      }
      if (this.PLATFORM_TYPES.indexOf(role['name']) !== -1) {
        if (this.selectedPlatformTypes.includes(role['name'])) {
          this.rolesToAdd.push({
            id: role['id'],
            name: role['name'],
          });
        } else {
          this.rolesToRemove.push({
            id: role['id'],
            name: role['name'],
          });
        }
      } else if (role['name'] === 'OPS') {
        opsRoleId = role['id'];
      }
    });
    this.addOpsRole(opsRoleId);
  }

  private addOpsRole(opsRoleId): void {
    if (this.rolesToAdd.length !== 0 && opsRoleId) {
      this.rolesToAdd.push({
        id: opsRoleId,
        name: 'OPS',
      });
    } else {
      this.rolesToRemove.push({
        id: opsRoleId,
        name: 'OPS',
      });
    }
  }

  private async changeUserRoles() {
    this.loader = true;
    this.getUserRolesToChangeInKeycloak();
    const roleDetails = {
      userId: this.data.userInformation['userId'],
      username: this.data.username,
      rolesToAdd: this.rolesToAdd,
      rolesToRemove: this.rolesToRemove,
    };

    const keyCloakUsername = keyCloakUser.getUsername();
    await this.userService.updateRoles(roleDetails).subscribe(
      (response) => {
        const additionalTags = {
          afterUpdate: roleDetails,
          signum: keyCloakUsername,
        };
        const message = `User ${this.data.username}'s roles successfully updated by ${keyCloakUsername}`;
        this.angularLogger.info(message, additionalTags);
        this.openSnackBar(
          `User ${this.data.username} successfully updated!`, 5000, 'custom-snackbar-class');
        this.loader = false;
        this.closeDialogModal();
        if (this.data.username === keyCloakUsername) {
          window.open('/', '_self');
        } else {
          this.router.navigate(['/']);
        }
      },
      (error) => {
        console.log(error);
        this.openSnackBar(
          `Failed to update user ${this.data.username}!`, 7000, 'error-snackbar-class');
        this.loader = false;
        this.closeDialogModal();
      },
    );
  }

  private enableDisableSpecifiedTestPhases(testPhases: string[], checkboxAction: string): void {
    testPhases.forEach((testPhase) => {
      this.enableDisable(testPhase, checkboxAction);
    });
  }

  private enableDisableSpecifiedPlatformTypes(platformTypes: string[], checkboxAction: string): void {
    platformTypes.forEach((platformTypes) => {
      this.enableDisablePlatformType(platformTypes, checkboxAction);
    });
  }

  public enableDisablePlatformType(platformType: string, checkboxAction: string): void {
    if (this.PLATFORM_TYPES.indexOf(platformType) !== -1) {
      this.updatePlatformTypeCheckbox(PlatformTypesToCheckboxMapping[platformType], checkboxAction);
      this.addRemoveFromPlatformTypeSelected(checkboxAction, platformType);
    }
  }

  private updatePlatformTypeCheckbox(checkboxToUpdate: string, checkboxAction: string): void {
    checkboxAction === 'disable' ? this.platformTypesCheckbox[checkboxToUpdate] = false :
      this.platformTypesCheckbox[checkboxToUpdate] = true;
  }

  private addRemoveFromPlatformTypeSelected(checkboxAction: string, platformType: string): any {
    if (checkboxAction === 'enable') {
      if (!this.selectedPlatformTypes.includes(platformType)) {
        this.selectedPlatformTypes.push(platformType);
      }
    } else if (checkboxAction === 'disable') {
      const indexOfPlatformTypeToRemove = this.selectedPlatformTypes.indexOf(platformType, 0);
      this.selectedPlatformTypes.splice(indexOfPlatformTypeToRemove, 1);
    }
  }

  public enableDisable(testPhase: string, checkboxAction: string): void {
    if (this.SUPPORTED_TEST_PHASES.indexOf(testPhase) !== -1) {
      this.updateCheckbox(PhasesToCheckboxMapping[testPhase], checkboxAction);
      this.addRemoveFromPhasesSelected(checkboxAction, testPhase);
    }
  }

  private addRemoveFromPhasesSelected(checkboxAction: string, testPhase: string): void {
    if (checkboxAction === 'enable') {
      if (!this.selectedTestPhases.includes(testPhase)) {
        this.selectedTestPhases.push(testPhase);
      }
    } else if (checkboxAction === 'disable') {
      const indexOfPhaseToRemove = this.selectedTestPhases.indexOf(testPhase, 0);
      this.selectedTestPhases.splice(indexOfPhaseToRemove, 1);
    }
  }

  private changeTestPhases(testPhase: string, checkbox: MatCheckboxChange): void {
    if (checkbox.checked) {
      this.enableDisable(testPhase, 'enable');
    } else {
      this.removeFromSelectedTestPhases(testPhase);
    }
  }

  private changePlatformType(platformType: string, checkbox: MatCheckboxChange): void {
    if (checkbox.checked) {
      this.enableDisablePlatformType(platformType, 'enable');
    } else {
      this.removeFromSelectedPlatformTypes(platformType);
    }
    this.getDeploymentsForPlatformTypes();
  }

  private removeFromSelectedTestPhases(testPhase: string): void {
    const indexOfTestPhase = this.selectedTestPhases.indexOf(testPhase);
    if (indexOfTestPhase !== -1) {
      this.selectedTestPhases.splice(indexOfTestPhase, 1);
    }
  }

  private removeFromSelectedPlatformTypes(platformType: string): void {
    const indexOfPlatformType = this.selectedPlatformTypes.indexOf(platformType);
    if (indexOfPlatformType !== -1) {
      this.selectedPlatformTypes.splice(indexOfPlatformType, 1);
    }
  }

  private getDeploymentsForPlatformTypes(): void {
    let requiredplatformTypes = '';
    this.selectedPlatformTypes.forEach((platformType) => {
      if (requiredplatformTypes) requiredplatformTypes += '&';
      requiredplatformTypes += platformType;
    });
  }

  private updateCheckbox(checkboxToUpdate: string, checkboxAction: string): void {
    checkboxAction === 'disable' ? this.phasesCheckbox[checkboxToUpdate] = false :
      this.phasesCheckbox[checkboxToUpdate] = true;
  }

  private closeDialogModal(): void {
    this.dialogRef.close();
  }

  private openSnackBar(message: string, time: number, cssClass: string): void {
    this.snackBar.open(message, '', {
      duration: time,
      panelClass: cssClass,
    });
  }

  public selectTestPhases(testPhasesToSelect: string): void {
    let phasesToIterate: string[] = [];
    if (testPhasesToSelect === 'all') {
      this.enableDisableSpecifiedTestPhases(this.SUPPORTED_TEST_PHASES, 'enable');
      this.enableDisableSpecifiedPlatformTypes(this.PLATFORM_TYPES, 'enable');
    } else if (testPhasesToSelect === 'mte') {
      phasesToIterate = this.MT_ENTRY_PHASES;
    } else if (testPhasesToSelect === 'mtv') {
      phasesToIterate = this.MT_VALIDATION_PHASES;
    } else if (testPhasesToSelect === 'sprintRelease') {
      phasesToIterate = this.SPRINT_RELEASE_PHASES;
    } else if (testPhasesToSelect === 'other') {
      phasesToIterate = this.OTHER_PHASES;
    }

    this.iteratePhases(phasesToIterate, this.isAllSelectedForTestPhase(testPhasesToSelect));
  }

  private isAllSelectedForTestPhase(testPhasesToSelect: string): boolean {
    let isAllSelected: boolean;
    if (testPhasesToSelect === 'mte') {
      isAllSelected = this.isAllMTESelected();
    } else if (testPhasesToSelect === 'mtv') {
      isAllSelected = this.isAllMTVPhasesSelected();
    } else if (testPhasesToSelect === 'sprintRelease') {
      isAllSelected = this.isAllSprintReleaseSelected();
    } else if (testPhasesToSelect === 'other') {
      isAllSelected = this.isAllOtherSelected();
    }
    return isAllSelected;
  }

  private iteratePhases(phasesToIterate: string[], isEnabled: boolean): void {
    phasesToIterate.forEach((phase) => {
      isEnabled ? this.enableDisable(phase, 'disable') : this.enableDisable(phase, 'enable');
    });
  }

  private iteratePlatformTypes(platformTypesToIterate: string[], isEnabled: boolean): void {
    platformTypesToIterate.forEach((platformType) => {
      isEnabled ? this.enableDisablePlatformType(platformType, 'disable') :
        this.enableDisablePlatformType(platformType, 'enable');
    });
  }

  public selectPlatformTypes(platformTypesToSelect: string): void {
    let platformTypesToIterate: string[] = [];
    platformTypesToIterate = this.PLATFORM_TYPES;
    this.iteratePlatformTypes(platformTypesToIterate, this.isAllSelectedForPlatformTypes(platformTypesToSelect));
  }

  private isAllSelectedForPlatformTypes(platformTypesToSelect: string): boolean {
    let isAllSelected: boolean;
    if (platformTypesToSelect === 'ALL') {
      isAllSelected = this.isALLPlatformtypeSelected();
    }
    return isAllSelected;
  }

  private isALLPlatformtypeSelected(): boolean {
    return this.platformTypesCheckbox.physicalCheckbox && this.platformTypesCheckbox.venmCheckbox
      && this.platformTypesCheckbox.cenmCheckbox && this.platformTypesCheckbox.sienmCheckbox;
  }

  private isAllMTESelected(): boolean {
    return this.phasesCheckbox.mteCheckbox;
  }

  private isAllMTVPhasesSelected(): boolean {
    return this.phasesCheckbox.cdlCheckbox && this.phasesCheckbox.longLoopCheckbox
      && this.phasesCheckbox.rvbCheckbox && this.phasesCheckbox.stkpiCheckbox
      && this.phasesCheckbox.rnlCheckbox;
  }

  private isAllSprintReleaseSelected(): boolean {
    return this.phasesCheckbox.dropbackCheckbox && this.phasesCheckbox.plmCheckbox
      && this.phasesCheckbox.enduranceCheckbox && this.phasesCheckbox.sprintValidationCheckbox;
  }

  private isAllOtherSelected(): boolean {
    return this.phasesCheckbox.teaasCheckbox && this.phasesCheckbox.rtdCheckbox && this.phasesCheckbox.csCheckbox;
  }

  private resetTestPhases(): void {
    this.selectedTestPhases = [];
    this.enableDisableSpecifiedTestPhases(this.SUPPORTED_TEST_PHASES, 'disable');
    this.enableDisableSpecifiedPlatformTypes(this.PLATFORM_TYPES, 'disable');
    this.enableDisableSpecifiedPlatformTypes(this.listOfRolesAssignedToUser, 'enable');
    this.enableDisableSpecifiedTestPhases(this.listOfRolesAssignedToUser, 'enable');
  }
}
