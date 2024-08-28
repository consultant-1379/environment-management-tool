import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { SessionService } from '../../quarantine-management/session.service';
import { TimePeriod } from '../../models/timePeriod';
import { Subscription } from 'rxjs';
import { Session } from '../../models/session';
import { DeploymentSessionService } from '../../services/deployment-session.service';
import { TeamInventoryService } from '../../services/team-inventory.service';
import { TimersService } from '../../quarantine-management/timers.service';
import *  as _ from 'lodash';
import * as moment from 'moment-timezone';
import { Timer } from 'app/models/timer';
import { keyCloakUser } from './../../utils/app-init';
import { Logger } from './../../services/logging.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AnsibleService } from './../../services/ansible.service';

const MS : string = 'ms1';
const WLVM : string = 'wlvm';
@Component({
  templateUrl: './manage-session.component.html',
  styleUrls: ['./manage-session.component.css'],
})
export class ManageButtonComponent implements OnInit {
  private acceptedEmailProviders = ['ericsson', 'wipro', 'tcs', 'sidero', 'cybercom',
    'intracom-telecom', 'ammeon'];
  private dropdownList = [];
  private selectedItems = [];
  private enteredEmails = [];
  private emailValidationError = false;
  API = environment.apiUrl;
  sessionForm: FormGroup;
  dropdownSettings = {
    singleSelection: false,
    idField: 'name',
    textField: 'name',
    allowSearchFilter: true,
    maxHeight: 170,
    enableCheckAll: false,
  };
  userEmailsSelectable: boolean = true;
  userEmailsRemovable: boolean = true;
  userEmailsAddOnBlur: boolean = true;
  readonly userEmailsSeparatorKeyCodes: number[] = [ENTER, COMMA];
  hours: number = 0;
  minutes: number = 0;
  navigationEndEventSubscription: Subscription;
  teams = [];
  activeSession: Session;
  timePeriod: TimePeriod;
  sessionEndTime: moment;
  updatedTimer: Timer;
  oldHours: number;
  oldMinutes: number;
  private signum: string = '';
  private manageSessionStepDescription: string = '';
  private isLoaderEnabled: boolean = false;
  createUserOnWlvm: boolean;

  @HostListener('window:beforeunload', ['$event'])
    onWindowClose(event: any): void {
    event.preventDefault();
    event.returnValue = false;
  }

  constructor(
    public dialogRef: MatDialogRef<ManageButtonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private deploymentSessionService: DeploymentSessionService,
    private teamInventoryService: TeamInventoryService,
    private timersService: TimersService,
    private angularLogger: Logger,
    private ansibleService: AnsibleService,
  ) { }

  ngOnInit() {
    const findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index);
    this.getTeamsInfo();
    this.getSelectedTeamsAndUsers();
    this.signum = keyCloakUser.getUsername();
    this.sessionForm = this.formBuilder.group(
      {
        selectedItems: new FormControl([]),
        enteredEmails: new FormControl([]),
        hours: '',
        minutes: '',
        createUserOnWlvm: false,
      },
      {
        validator: (formControl) => {
          this.emailValidationError = false;
          const hoursCtrl = formControl.controls.hours;
          const minutesCtrl = formControl.controls.minutes;
          const selectedItemsCtrl = formControl.controls.selectedItems;
          const enteredEmailsCtrl = formControl.controls.enteredEmails;
          const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          if (selectedItemsCtrl !== undefined && enteredEmailsCtrl !== undefined) {
            if (selectedItemsCtrl.value.length === 0 && enteredEmailsCtrl.value.length === 0) {
              return { invalid: true };
            }
            if (enteredEmailsCtrl.value.length !== 0) {
              for (const enteredEmail of enteredEmailsCtrl.value) {
                if (!enteredEmail.match(mailformat) ||
                !this.acceptedEmailProviders.includes(enteredEmail.split('@')[1].split('.')[0])) {
                  this.emailValidationError = true;
                  return { invalid: true };
                }
                if (findDuplicates(enteredEmailsCtrl.value).length > 0) {
                  this.emailValidationError = true;
                  return { invalid: true };
                }
              }
            }
          }
          if (hoursCtrl !== undefined && minutesCtrl !== undefined) {
            if ((hoursCtrl.value <= '0' && minutesCtrl.value <= '0')
            || (hoursCtrl.value > '9999')
            || (String(hoursCtrl.value).includes('.')
            || String(minutesCtrl.value).includes('.'))
            || (minutesCtrl.value > '59')) {
              return { invalid: true };
            }
          }
        },
      },
    );
    this.getTimeRemaining();
  }

  ngOnDestroy() {
    if (this.navigationEndEventSubscription) {
      this.navigationEndEventSubscription.unsubscribe();
    }
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: 'custom-snackbar-class',
    });
  }

  async stopSession() {
    await this.sessionService.updateEndTimeOfSession(this.data.deployment._id);
    const timePeriod = await this.sessionService.getTimePeriod(this.data.deployment._id);
    await this.sessionService.deleteTimer(timePeriod);

    this.dialogRef.close();
    const additionalTags = {
      signum: keyCloakUser.getUsername(),
      environment: this.data.environmentNameToAdd,
    };
    const message = `Session stopped by ${this.signum} on ${this.data.deployment.name}`;
    this.angularLogger.info(message, additionalTags);
    this.openSnackBar(`Session stopped for: ${this.data.deployment.name}`);
  }

  public async editSession(sessionId: string, jiras: string) {
    this.isLoaderEnabled = true;
    this.manageSessionStepDescription = 'Preparing to modify session...';

    const sessionUpdate = new Session;
    const selectedTeams = this.selectedItems;
    const oldTeamNames = this.activeSession[0].assignedTeam;
    const addedTeams = _.difference(selectedTeams, oldTeamNames);
    const removedTeams = _.difference(oldTeamNames, selectedTeams);
    let teamsToCreateWlvmUserOn = _.difference(oldTeamNames, selectedTeams);

    const assignedUserEmails = this.enteredEmails;
    const oldAssignedUserEmails = this.activeSession[0].assignedUserEmails;
    const removedAssignedUserEmails = _.difference(oldAssignedUserEmails, assignedUserEmails);
    const assignedTeamsEmail = this.fetchEmailList(selectedTeams);
    const assignedUserNames = this.fetchIndividualNamesFromEmails(this.enteredEmails);
    const oldAssignedUserNames = this.activeSession[0].assignedUserNames;
    const addedAssignedUserNames = _.difference(assignedUserNames, oldAssignedUserNames);
    const removedAssignedUserNames = _.difference(oldAssignedUserNames, assignedUserNames);
    let assignedUsersToCreateWlvmUserOn =
    _.difference(oldAssignedUserNames, assignedUserNames);

    const allTeams = _.concat(selectedTeams, removedTeams);
    const allTeamsEmail = this.fetchEmailList(allTeams);

    const allSessionAssigneeEmails = _.concat(allTeamsEmail,
                                              assignedUserEmails, removedAssignedUserEmails);
    const allSessionAssignees = _.concat(allTeams, assignedUserNames, removedAssignedUserNames);
    const addedAssignees = _.concat(addedTeams, addedAssignedUserNames);
    const removedAssignees = _.concat(removedTeams, removedAssignedUserNames);

    const isEnvironmentPhysical = this.determineIfEnvironmentIsPhysical(this.activeSession[0]);

    if (_.isEmpty(teamsToCreateWlvmUserOn)) {
      teamsToCreateWlvmUserOn = oldTeamNames;
    }
    if (_.isEmpty(assignedUsersToCreateWlvmUserOn)) {
      assignedUsersToCreateWlvmUserOn = oldAssignedUserNames;
    }

    if (!isEnvironmentPhysical) {
      this.setCredentialDefaultsIfEnvironmentIsCloud();
    }

    await this.populateTimePeriod();
    const isMsUserCreationAndDeletionSuccessful =
      await this.performMsUserCreationAndDeletion(
        removedAssignedUserNames, removedTeams, addedAssignedUserNames,
        addedTeams, assignedUsersToCreateWlvmUserOn, teamsToCreateWlvmUserOn,
        this.activeSession[0].deploymentName, isEnvironmentPhysical,
        this.activeSession[0].sessionUsername.assignedTeamUsername,
        this.activeSession[0].sessionUsername.assignedUserUsername,
        );

    if (isMsUserCreationAndDeletionSuccessful) {
      await this.populateSession(sessionUpdate, sessionId, jiras, selectedTeams, assignedTeamsEmail,
                                 assignedUserNames, assignedUserEmails,
                                 this.activeSession[0].sessionUsername,
                                 this.activeSession[0].sessionPassword, isEnvironmentPhysical);
      await this.deploymentSessionService.changeTimer(this.timePeriod, sessionUpdate);
      this.updatedTimer = await this.timersService.getTimer(this.timePeriod.timerId);
      await this.deploymentSessionService.changeTimePeriod(this.updatedTimer, sessionUpdate);
      await this.updateSessionTimes(sessionUpdate, this.updatedTimer);

      this.deploymentSessionService.updateSession(sessionUpdate);
      const wasDurationChanged = this.checkIfDurationWasChanged();

      sessionUpdate.sessionUsername = this.activeSession[0].sessionUsername;
      sessionUpdate.sessionPassword = this.activeSession[0].sessionPassword;

      await this.deploymentSessionService
        .sendSessionUpdatedEmail(sessionUpdate, allSessionAssigneeEmails, allSessionAssignees,
                                 addedAssignees, removedAssignees, wasDurationChanged,
                                 this.oldHours, this.oldMinutes, this.data.deployment.testPhase,
                                 this.createUserOnWlvm);
      const hiddenUserPasswords = this.setSessionPasswordsToBlank(
        sessionUpdate.sessionPassword['assignedUserPassword']);
      const hiddenTeamPasswords = this.setSessionPasswordsToBlank(
        sessionUpdate.sessionPassword['assignedTeamPassword']);
      sessionUpdate.sessionPassword['assignedUserPassword'] = hiddenUserPasswords;
      sessionUpdate.sessionPassword['assignedTeamPassword'] = hiddenTeamPasswords;

      const additionalTags = {
        afterUpdate: { sessionUpdate },
      };
      const message =
        `Session updated by ${keyCloakUser.getUsername()} on ${this.data.deployment.name}`;
      this.angularLogger.info(message, additionalTags);
      this.cancel();
      this.openSnackBar(`Session Updated for: ${this.data.deployment.name}`);
    } else {
      this.openErrorSnackBar(`Unable to update session on ${this.data.deployment.name}`);
      this.closeDialogModal();
    }
  }

  private async performMsUserCreationAndDeletion(
    removedAssignedUserNames: string[], removedTeams: string[], addedAssignedUserNames: string[],
    addedTeams: string[], assignedUsersToCreateWlvmUserOn: string[],
    teamsToCreateWlvmUserOn: string[], environmentName: string, isEnvironmentPhysical: boolean,
    assignedTeamsTroubleshootingUsernames, assignedUserTroubleshootingUsernames): Promise<any> {
    if (isEnvironmentPhysical) {
      const isPasswordlessAccessVerified = await
      this.ensurePasswordlessConnectionWithEnvironment(environmentName);

      if (isPasswordlessAccessVerified) {
        await this.removeUserFromMsOrWlvm(
          this.activeSession[0].assignedTeam, removedTeams, environmentName, 'Team',
          assignedTeamsTroubleshootingUsernames, this.createUserOnWlvm);

        await this.removeUserFromMsOrWlvm(
          this.activeSession[0].assignedUserNames, removedAssignedUserNames,
          environmentName, 'User', assignedUserTroubleshootingUsernames, this.createUserOnWlvm);

        this.activeSession[0].sessionUsername = this.formatEmptyObjectKey(
          this.activeSession[0].sessionUsername);
        this.activeSession[0].sessionPassword = this.formatEmptyObjectKey(
          this.activeSession[0].sessionPassword);

        await this.createUsersOnMsOrWlvm(addedAssignedUserNames, 'User', environmentName);
        await this.createUsersOnMsOrWlvm(addedTeams, 'Team', environmentName);

        if (this.createUserOnWlvm) {
          await this.createUsersOnWlvmOnly(assignedUsersToCreateWlvmUserOn, 'User', environmentName);
          await this.createUsersOnWlvmOnly(teamsToCreateWlvmUserOn, 'Team', environmentName);
        }
        return true;
      }
      return false;
    }
    return true;
  }

  private async createUsersOnMsOrWlvm(
    addedAssignees: string[], typeOfUser: string, environmentName: string) {
    if (addedAssignees.length > 0) {
      this.manageSessionStepDescription = 'Creating troubleshooting user on MS';
      const assigneeCredentials = this.generateSessionCredentials(addedAssignees);
      for (const addedAssignee in addedAssignees) {
        await this.ansibleService.createUserInMsOrWlvm(
          environmentName, assigneeCredentials[0][addedAssignee],
          assigneeCredentials[1][addedAssignee], MS)
          .subscribe(
            () => {},
          );
        if (this.createUserOnWlvm) {
          this.manageSessionStepDescription = 'Creating troubleshooting user on WLVM';
          await this.ansibleService.createUserInMsOrWlvm(environmentName,
                                                         assigneeCredentials[0][addedAssignee],
                                                         assigneeCredentials[1][addedAssignee],
                                                         WLVM)
            .toPromise()
            .catch((err) => {
              return false;
            });
        }
        this.activeSession[0].sessionUsername[`assigned${typeOfUser}Username`]
          .push(assigneeCredentials[0][addedAssignee]);
        this.activeSession[0].sessionPassword[`assigned${typeOfUser}Password`]
          .push(assigneeCredentials[1][addedAssignee]);
      }
    }
  }

  private async createUsersOnWlvmOnly(assigneesToCreateWlvmUserOn: string[],
                                      typeOfUser: string, environmentName: string) {
    if (assigneesToCreateWlvmUserOn.length > 0) {
      for (const assignee in assigneesToCreateWlvmUserOn) {
        this.manageSessionStepDescription =
        'Creating troubleshooting user on WLVM for previous assignees';
        if (typeOfUser === 'Team') {
          await this.ansibleService.createUserInMsOrWlvm(environmentName,
                                                         this.activeSession[0].sessionUsername.
                                                         assignedTeamUsername[assignee],
                                                         this.activeSession[0].sessionPassword.
                                                         assignedTeamPassword[assignee],
                                                         WLVM)
            .toPromise()
            .catch((err) => {
              return false;
            });
        } else if (typeOfUser === 'User') {
          await this.ansibleService.createUserInMsOrWlvm(environmentName,
                                                         this.activeSession[0].sessionUsername.
                                                         assignedUserUsername[assignee],
                                                         this.activeSession[0].sessionPassword.
                                                         assignedUserPassword[assignee],
                                                         WLVM)
            .toPromise()
            .catch((err) => {
              return false;
            });
        }
      }
    }
  }

  private generateSessionCredentials(assigneesToGenerateUsernameAndPasswordsFor: string[]): any[] {
    const maxLinuxUsernameLength = 32;
    const assigneeUsernames = [];
    const assigneePasswords = [];

    for (const sessionAssignee in assigneesToGenerateUsernameAndPasswordsFor) {
      let msUserUsername =
        `${assigneesToGenerateUsernameAndPasswordsFor[sessionAssignee]}_${
          Math.random().toString(36).slice(-8)}`;
      msUserUsername = msUserUsername.replace(/\s|\W/g, '');
      if (msUserUsername.length > maxLinuxUsernameLength) {
        msUserUsername = msUserUsername.substring(0, maxLinuxUsernameLength - 1);
      }
      assigneeUsernames.push(msUserUsername);
      assigneePasswords.push(Math.random().toString(36).slice(-8));
    }
    return [assigneeUsernames, assigneePasswords];
  }

  private async removeUserFromMsOrWlvm(
    currentAssignees: string[], removedAssignees: string[], environmentName: string,
    typeOfUser: string, assigneesTroubleshootingUsernames: string[],
    createUserOnWlvm: boolean) {
    if (removedAssignees.length > 0) {
      for (const assignee in currentAssignees) {
        if (removedAssignees.includes(currentAssignees[assignee])) {
          this.manageSessionStepDescription = 'Deleting user from MS';
          await this.ansibleService.deleteUserFromMsOrWlvm(
            environmentName, assigneesTroubleshootingUsernames[assignee], MS).toPromise()
            .then(
              async (deleteUser) => {
                if (deleteUser.includes('User not deleted')) {
                  await this.deploymentSessionService
                    .sendDeleteUserEmail(environmentName,
                                         assigneesTroubleshootingUsernames[assignee],
                                         this.data.deployment.testPhase,
                                         'LMS');
                }
              },
              async (error) => {},
            );
          this.manageSessionStepDescription = 'Deleting user from WLVM';
          await this.ansibleService.deleteUserFromMsOrWlvm(
              environmentName, assigneesTroubleshootingUsernames[assignee], WLVM).toPromise()
              .then(
                async (deleteUser) => {
                  if (deleteUser.includes('User not deleted')) {
                    await this.deploymentSessionService
                      .sendDeleteUserEmail(environmentName,
                                           assigneesTroubleshootingUsernames[assignee],
                                           this.data.deployment.testPhase,
                                           'WLVM');
                  }
                },
                async (error) => {},
              );
          this.activeSession[0].sessionPassword[`assigned${typeOfUser}Password`][assignee] = '';
          this.activeSession[0].sessionUsername[`assigned${typeOfUser}Username`][assignee] = '';
        }
      }
    }
    if (!createUserOnWlvm) {
      for (const assignee in currentAssignees) {
        this.manageSessionStepDescription = 'Deleting all session users from WLVM';
        await this.ansibleService.deleteUserFromMsOrWlvm(
            environmentName, assigneesTroubleshootingUsernames[assignee], WLVM).toPromise()
            .then(
              async (deleteUser) => {
                if (deleteUser.includes('User not deleted')) {
                  await this.deploymentSessionService
                    .sendDeleteUserEmail(environmentName,
                                         assigneesTroubleshootingUsernames[assignee],
                                         this.data.deployment.testPhase,
                                         'WLVM');
                }
              },
              async (error) => {},
            );
      }
    }
    this.activeSession[0].sessionPassword[`assigned${typeOfUser}Password`] =
      this.activeSession[0].sessionPassword[`assigned${typeOfUser}Password`]
      .filter(removeEmpty => removeEmpty);
    this.activeSession[0].sessionUsername[`assigned${typeOfUser}Username`] =
      this.activeSession[0].sessionUsername[`assigned${typeOfUser}Username`]
      .filter(removeEmpty => removeEmpty);
  }

  private async ensurePasswordlessConnectionWithEnvironment(deploymentName: string): Promise<any> {
    let passwordlessAccessVerified = true;
    this.manageSessionStepDescription =
      'Ensuring we have passwordless connection to the environment...';
    await this.ansibleService.ensurePasswordlessConnectionToEnvironment(deploymentName,
                                                                        this.createUserOnWlvm)
      .toPromise()
      .catch(() => {
        passwordlessAccessVerified = false;
        const message =
            `Failed when ensuring passwordless connection to
            environment: ${deploymentName}`;
        this.handleIfAnsibleFailed(message, environment);
      });
    return passwordlessAccessVerified;
  }

  private handleIfAnsibleFailed(message: string, environment): void {
    const additionalTags = {
      signum: this.signum,
      // tslint:disable-next-line:object-shorthand-properties-first
      environment,
    };
    this.angularLogger.info(message, additionalTags);
    this.closeDialogModal();
    this.openErrorSnackBar(message);
  }

  private setSessionPasswordsToBlank(sessionPasswords): any {
    for (const sessionPassword in sessionPasswords) {
      sessionPasswords[sessionPassword] = '*****';
    }
    return sessionPasswords;
  }

  private populateTimePeriod(): void {
    this.timePeriod  = new TimePeriod;
    this.timePeriod.durationHours = this.hours;
    this.timePeriod.durationMinutes = this.minutes;
  }

  private checkIfDurationWasChanged(): boolean {
    if (!(this.hours === this.oldHours) || !(this.minutes === this.oldMinutes)) {
      return true;
    }
    return false;
  }

  private populateSession(sessionUpdate: Session, sessionId: string, jiras: string,
                          selectedTeams: string[], teamEmail: string[],
                          assignedUserNames: string[], assignedUserEmails: string[],
                          lmsUsernames, lmsPasswords, isEnvironmentPhysical: boolean): void {
    sessionUpdate.deploymentId = this.data.deployment._id;
    sessionUpdate.deploymentName = this.data.deployment.name;
    sessionUpdate._id = sessionId;
    sessionUpdate.jira = this.convertJiraStringToArray(jiras);
    sessionUpdate.assignedTeam = selectedTeams;
    sessionUpdate.teamEmail = teamEmail;
    sessionUpdate.assignedUserNames = assignedUserNames;
    sessionUpdate.assignedUserEmails = assignedUserEmails;
    sessionUpdate.timePeriodId = this.activeSession[0].timePeriodId;
    sessionUpdate.createUserOnWlvm = this.createUserOnWlvm;
    if (isEnvironmentPhysical) {
      const formattedLmsUsernames = this.formatEmptyObjectKey(lmsUsernames);
      const formattedLmsPasswords = this.formatEmptyObjectKey(lmsPasswords);

      sessionUpdate.sessionUsername = {
        assignedUserUsername: formattedLmsUsernames.assignedUserUsername,
        assignedTeamUsername: formattedLmsUsernames.assignedTeamUsername,
      };
      sessionUpdate.sessionPassword = {
        assignedUserPassword: formattedLmsPasswords.assignedUserPassword,
        assignedTeamPassword: formattedLmsPasswords.assignedTeamPassword,
      };
    }
  }

  private formatEmptyObjectKey(objectToFormat) {
    for (const objectKey in objectToFormat) {
      if (objectToFormat[objectKey][0] === '') {
        objectToFormat[objectKey] = [];
      }
    }
    return objectToFormat;
  }

  private async updateSessionTimes(sessionUpdate: Session, timer: Timer) {
    const timePeriod = await this.sessionService.getTimePeriod(this.data.deployment._id);
    sessionUpdate.timePeriodId = this.activeSession[0].timePeriodId;
    sessionUpdate.hours = timePeriod.durationHours.valueOf();
    sessionUpdate.minutes = timePeriod.durationMinutes.valueOf();
    sessionUpdate.startTime = timer.startTime;
    sessionUpdate.endTime = timer.endTime;
  }

  private fetchEmailList(assignedTeam): string[] {
    const emailList = [];
    for (const team in assignedTeam) {
      for (const index in this.teams) {
        if (this.teams[index].name === assignedTeam[team]) {
          emailList.push(this.teams[index].email);
          break;
        }
      }
    }
    return emailList;
  }

  private convertJiraStringToArray(jiras: string): string[] {
    return this.parseInsertedJiras(jiras.replace(/ /g, '').split(','));
  }

  private parseInsertedJiras(jiras: string[]): string[] {
    const parsedJiras: string[] = [];
    for (let i = 0; i < jiras.length; i += 1) {
      if (jiras[i].includes('jira')) {
        parsedJiras.push(this.getJiraNumberFromURL(jiras[i]));
      } else {
        parsedJiras.push(jiras[i]);
      }
    }
    return parsedJiras;
  }

  private getJiraNumberFromURL(jiraUrlToCut: string): string {
    const jiraUrl = 'https://jira-oss.seli.wh.rnd.internal.ericsson.com/browse/';
    return jiraUrlToCut.replace(jiraUrl, '');
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private getTeamsInfo(): void {
    this.teamInventoryService.getTeamsInfoFromTeamInventoryTool()
      .subscribe(
        (teamsInfo) => {
          this.populateTeamsWithEmail(teamsInfo['items']);
        },
        (error) => {
          this.teamInventoryService.getTeamsInfoFromDatabase()
            .subscribe(
              (teamsInfo) => {
                this.populateTeamsWithEmail(teamsInfo['items']);
              },
            );
        },
      );
  }

  private populateTeamsWithEmail(teamInventoryList: Object[]): void {
    this.teams = teamInventoryList;
    const listOfUnorderedTeams = [];
    for (const team of this.teams) {
      if (team['email']) {
        if (!(team['email'] === 'null')) {
          listOfUnorderedTeams.push(team['name']);
        }
      }
    }
    this.dropdownList = listOfUnorderedTeams.sort((oneTeamName, anotherTeamName) =>
    (oneTeamName > anotherTeamName ? 1 : -1),
    );
  }

  private async getSelectedTeamsAndUsers() {
    this.activeSession = await this.sessionService.
    getActiveSessionFromDeploymentId(this.data.deployment._id);
    this.selectedItems = this.activeSession[0].assignedTeam;
    this.enteredEmails = this.activeSession[0].assignedUserEmails;
    this.createUserOnWlvm = this.activeSession[0].createUserOnWlvm;
    this.sessionForm.patchValue({ enteredEmails: this.enteredEmails });
  }

  private async getTimeRemaining() {
    this.activeSession = await this.sessionService.
      getActiveSessionFromDeploymentId(this.data.deployment._id);
    this.sessionEndTime = moment(this.activeSession[0].endTime);
    const timeRightNow = moment.utc();
    this.oldHours = this.sessionEndTime.diff(timeRightNow, 'hours');
    this.oldMinutes =
      this.sessionEndTime.diff(timeRightNow, 'minutes') - (this.oldHours * 60);
    this.hours = this.oldHours;
    this.minutes = this.oldMinutes;
  }

  private fetchIndividualNamesFromEmails(assignedEmails: string[]): string[] {
    const individualNameList = [];
    for (const assignedEmail of assignedEmails) {
      const fullName = assignedEmail.split('@')[0].split('.');
      const firstName = fullName[0][0].toUpperCase() + fullName[0].slice(1);
      const lastName = fullName[fullName.length - 1][0].toUpperCase() + fullName[fullName.length - 1].slice(1);
      individualNameList.push(`${firstName} ${lastName}`);
    }
    return individualNameList;
  }

  private addUserEmail(enteredUserEmailEvent: MatChipInputEvent): void {
    const enteredEmailInput = enteredUserEmailEvent.input;
    const enteredEmailInputValue = enteredUserEmailEvent.value;

    if ((enteredEmailInputValue || '').trim()) {
      this.enteredEmails.push(enteredEmailInputValue.trim());
      this.sessionForm.patchValue({ enteredEmails: this.enteredEmails });
    }

    if (enteredEmailInput) {
      enteredEmailInput.value = '';
    }
  }

  private determineIfEnvironmentIsPhysical(session: Session): boolean {
    if (session.sessionUsername) {
      return true;
    }
    return false;
  }

  private setCredentialDefaultsIfEnvironmentIsCloud() {
    this.activeSession[0].sessionUsername = {};
    this.activeSession[0].sessionPassword = {};
    this.activeSession[0].sessionUsername.assignedTeamUsername = [];
    this.activeSession[0].sessionUsername.assignedUserUsername = [];
    this.activeSession[0].sessionPassword.assignedTeamPassword = [];
    this.activeSession[0].sessionPassword.assignedUserPassword = [];
  }

  private removeUserEmail(email: string): void {
    const indexOfEnteredUserEmails = this.enteredEmails.indexOf(email);

    if (indexOfEnteredUserEmails >= 0) {
      this.enteredEmails.splice(indexOfEnteredUserEmails, 1);
      this.sessionForm.patchValue({ enteredEmails: this.enteredEmails });
    }
  }

  openErrorSnackBar(message: string): void {
    this.snackBar.open(message, '', {
      duration: 7000,
      panelClass: 'error-snackbar-class',
    });
  }

  closeDialogModal() {
    this.dialogRef.close();
  }
}
