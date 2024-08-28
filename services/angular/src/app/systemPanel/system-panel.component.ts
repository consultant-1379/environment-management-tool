import { Component, OnInit, ElementRef, ViewChild, Input, ChangeDetectorRef } from '@angular/core';

import { keyCloakUser } from './../utils/app-init';
import { EventsService } from './../services/event.service';
import { MatCheckboxChange } from '@angular/material';

import { PhasesCheckbox }  from './phasesCheckbox';
import { PhasesToCheckboxMapping } from './phasesToCheckboxMapping';
import { PlatformTypesCheckbox } from './platformTypesCheckbox';
import { PlatformTypesToCheckboxMapping } from './platformTypesToCheckboxMapping';

@Component({
  selector: 'app-system-panel',
  templateUrl: './system-panel.component.html',
  styleUrls: ['./system-panel.component.css'],
})
export class SystemPanelComponent implements OnInit {
  private MT_ENTRY_PHASES: string[] = ['MTE'];
  private MT_VALIDATION_PHASES: string[] = [
    'CDL', 'LongLoop', 'RVB', 'STKPI', 'RNL',
  ];
  private SPRINT_RELEASE_PHASES: string[] = [
    'DROPBACK', 'PLM', 'ENDURANCE', 'SprintValidation',
  ];
  private OTHER_PHASES: string[] = ['TEaaS', 'RTD', 'CS'];
  private PLATFORM_TYPES: string[] = ['physical', 'vENM', 'SIENM', 'cENM'];
  private SUPPORTED_TEST_PHASES: string[] =
    this.MT_ENTRY_PHASES.concat(
      this.MT_VALIDATION_PHASES, this.SPRINT_RELEASE_PHASES, this.OTHER_PHASES,
    );

  @ViewChild('syspanel') syspanel: ElementRef;

  private phasesCheckbox: PhasesCheckbox;
  private platformTypesCheckbox : PlatformTypesCheckbox;

  @Input() username: string;
  @Input() isHidden: boolean;

  private showTestPhases: boolean = true;
  private selectedTestPhases: string[] = [];
  private selectedPlatformTypes: string[] = [];
  private listOfRolesAssignedToUser: string[];

  constructor(
    private eventsService: EventsService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.phasesCheckbox = new PhasesCheckbox();
    this.platformTypesCheckbox = new PlatformTypesCheckbox();
    this.listenForMessageFromDeployments();
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

  public enableDisable(testPhase: string, checkboxAction: string): void {
    if (this.SUPPORTED_TEST_PHASES.indexOf(testPhase) !== -1) {
      this.updateCheckbox(PhasesToCheckboxMapping[testPhase], checkboxAction);
      this.addRemoveFromPhasesSelected(checkboxAction, testPhase);
    }
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

  private updateCheckbox(checkboxToUpdate: string, checkboxAction: string): void {
    checkboxAction === 'disable' ? this.phasesCheckbox[checkboxToUpdate] = false :
      this.phasesCheckbox[checkboxToUpdate] = true;
  }

  private addRemoveFromPhasesSelected(checkboxAction: string, testPhase: string): any {
    if (checkboxAction === 'enable') {
      if (!this.selectedTestPhases.includes(testPhase)) {
        this.selectedTestPhases.push(testPhase);
      }
    } else if (checkboxAction === 'disable') {
      const indexOfPhaseToRemove = this.selectedTestPhases.indexOf(testPhase, 0);
      this.selectedTestPhases.splice(indexOfPhaseToRemove, 1);
    }
    this.getDeployments();
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
    this.getDeploymentsForPlatformTypes();
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

  public selectTestPhases(testPhasesToSelect: string): void {
    let phasesToIterate: string[] = [];
    if (testPhasesToSelect === 'all') {
      this.enableDisableSpecifiedTestPhases(this.SUPPORTED_TEST_PHASES, 'enable');
      this.enableDisableSpecifiedPlatformTypes(this.PLATFORM_TYPES, 'enable');
    } else if (testPhasesToSelect === 'mtEntry') {
      phasesToIterate = this.MT_ENTRY_PHASES;
    } else if (testPhasesToSelect === 'mtValidation') {
      phasesToIterate = this.MT_VALIDATION_PHASES;
    } else if (testPhasesToSelect === 'sprintRelease') {
      phasesToIterate = this.SPRINT_RELEASE_PHASES;
    } else if (testPhasesToSelect === 'other') {
      phasesToIterate = this.OTHER_PHASES;
    }

    this.iteratePhases(phasesToIterate, this.isAllSelectedForTestPhase(testPhasesToSelect));
    this.getDeployments();
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

  private isAllSelectedForTestPhase(testPhasesToSelect: string): boolean {
    let isAllSelected: boolean;
    if (testPhasesToSelect === 'mtEntry') {
      isAllSelected = this.isAllMTESelected();
    } else if (testPhasesToSelect === 'mtValidation') {
      isAllSelected = this.isAllMTVPhasesSelected();
    } else if (testPhasesToSelect === 'sprintRelease') {
      isAllSelected = this.isAllSprintReleaseSelected();
    } else if (testPhasesToSelect === 'other') {
      isAllSelected = this.isAllOtherSelected();
    }
    return isAllSelected;
  }

  private isAllMTESelected(): boolean {
    return this.phasesCheckbox.mteCheckbox;
  }

  private isALLPlatformtypeSelected(): boolean {
    return this.platformTypesCheckbox.physicalCheckbox && this.platformTypesCheckbox.venmCheckbox
      && this.platformTypesCheckbox.cenmCheckbox && this.platformTypesCheckbox.sienmCheckbox;
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
    this.enableDisableSpecifiedTestPhases(this.listOfRolesAssignedToUser, 'enable');
    this.enableDisableSpecifiedPlatformTypes(this.listOfRolesAssignedToUser, 'enable');
    this.getDeployments();
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

  private toggleSystemPanel(): void {
    this.eventsService.sendMessage('hideSystemBar');
  }

  private changeTestPhases(testPhase: string, checkbox: MatCheckboxChange): void {
    if (checkbox.checked) {
      this.enableDisable(testPhase, 'enable');
    } else {
      this.removeFromSelectedTestPhases(testPhase);
    }
    this.getDeployments();
    this.enableDisableSpecifiedPlatformTypes(this.selectedPlatformTypes, 'enable');
  }

  private changePlatformType(platformType: string, checkbox: MatCheckboxChange): void {
    if (checkbox.checked) {
      this.enableDisablePlatformType(platformType, 'enable');
    } else {
      this.removeFromSelectedPlatformTypes(platformType);
    }
    this.getDeploymentsForPlatformTypes();
  }

  private getDeployments(): void {
    let requiredTestPhases = '';
    this.selectedTestPhases.forEach((testPhase) => {
      if (requiredTestPhases) requiredTestPhases += '%';
      requiredTestPhases += testPhase;
    });
    this.eventsService.sendMessage(requiredTestPhases || 'reset');
  }

  private getDeploymentsForPlatformTypes(): void {
    let requiredplatformTypes = '';
    this.selectedPlatformTypes.forEach((platformType) => {
      if (requiredplatformTypes) requiredplatformTypes += '&';
      requiredplatformTypes += platformType;
    });
    this.eventsService.sendMessage(requiredplatformTypes || 'reset');
  }

  private listenForMessageFromDeployments(): void {
    this.eventsService.getMessage().subscribe((message) => {
      if (message === 'showTestPhases') {
        this.selectAllTestPhasesIfUserHasNoOpsRole();
        this.username = keyCloakUser.getUsername();
        this.listOfRolesAssignedToUser = keyCloakUser.getUserRoles();
        this.showTestPhases = true;
        this.changeDetector.detectChanges();
        this.enableDisableSpecifiedTestPhases(this.listOfRolesAssignedToUser, 'enable');
        this.enableDisableSpecifiedPlatformTypes(this.listOfRolesAssignedToUser, 'enable');
      }
      if (message === 'hideTestPhases') {
        this.showTestPhases = false;
      }
      if (message === 'selectphases') {
        this.enableDisableSpecifiedTestPhases(this.selectedTestPhases, 'enable');
      }
    });
  }

  public logOut(): void {
    keyCloakUser.logout();
  }

  private selectAllTestPhasesIfUserHasNoOpsRole(): void {
    if (!keyCloakUser.isUserInRole('OPS')) {
      this.selectTestPhases('all');
      this.selectPlatformTypes('ALL');
    }
  }
}
