import { Component, Input, OnInit, Inject, HostListener } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormGroup, Validators, FormControl, EmailValidator } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { DeploymentSessionService } from '../../services/deployment-session.service';
import { RoutingSessionService } from '../../services/routing.service';
import { TimePeriod } from '../../models/timePeriod';
import { Session } from '../../models/session';
import { Deployment } from '../../models/deployment';
import { Subscription, Observable } from 'rxjs';
import { TeamInventoryService } from '../../services/team-inventory.service';
import { DeploymentService } from '../../services/deployments.service';
import { keyCloakUser } from './../../utils/app-init';
import { Logger } from './../../services/logging.service';
import { AnsibleService } from './../../services/ansible.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

const MS : string = 'ms1';
const WLVM : string = 'wlvm';
@Component({
  selector: 'create-button',
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.css'],
})

export class CreateButtonComponent implements OnInit {
  private acceptedEmailProviders = ['ericsson', 'wipro', 'tcs', 'sidero', 'cybercom',
    'intracom-telecom', 'ammeon'];
  private dropdownList = [];
  private selectedItems = [];
  private enteredEmails = [];
  private teams = [];
  private session: Session = new Session;
  private timePeriod: TimePeriod = new TimePeriod;
  private hours: number = 0;
  private minutes: number = 0;
  private jira: string = '';
  private dropdownSettings = {};
  private API = environment.apiUrl;
  private navigationEndEventSubscription: Subscription;
  private sessionForm: FormGroup;
  private isLoaderEnabled: boolean = false;
  private createSessionStepDescription: string = '';
  private signum: string = '';
  private emailValidationError = false;
  private createUserOnWlvm: boolean = false;

  @HostListener('window:beforeunload', ['$event'])
    onWindowClose(event: any): void {
    event.preventDefault();
    event.returnValue = false;
  }

  constructor(
    public dialogRef: MatDialogRef<CreateButtonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private deploymentSessionService: DeploymentSessionService,
    private ansibleService: AnsibleService,
    private routingSessionService: RoutingSessionService,
    private snackBar: MatSnackBar,
    private inventoryService: TeamInventoryService,
    private deploymentService: DeploymentService,
    private angularLogger: Logger,
  ) { }

  private userEmailsSelectable: boolean = true;
  private userEmailsRemovable: boolean = true;
  private userEmailsAddOnBlur: boolean = true;
  private readonly userEmailsSeparatorKeyCodes: number[] = [ENTER, COMMA];

  ngOnInit() {
    this.navigationEndEventSubscription = this.routingSessionService.enablePageRefresh();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'name',
      textField: 'name',
      allowSearchFilter: true,
      maxHeight: 170,
      enableCheckAll: false,
    };
    this.getTeamsInfo();
    this.signum = keyCloakUser.getUsername();

    const findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index);

    this.sessionForm = this.formBuilder.group(
      {
        selectedItems: new FormControl([]),
        enteredEmails: new FormControl([]),
        hours: '',
        minutes: '',
        jira: '',
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
  }

  ngOnDestroy() {
    if (this.navigationEndEventSubscription) {
      this.navigationEndEventSubscription.unsubscribe();
    }
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

  private async startSession(environment: Deployment): Promise<void> {
    this.createSessionStepDescription = 'Preparing to create session...';
    this.isLoaderEnabled = true;

    const teamEmails = this.retrieveTeamsEmailList(this.selectedItems);
    const assignedUserNames = this.fetchIndividualNamesFromEmails(this.enteredEmails);

    this.setTimeToZeroIfNull();

    const individualTroubleshootingUserCredentials = this.generateTroubleshootingUserCredentials(
      assignedUserNames, environment.platformType);
    const teamTroubleshootingUserCredentials = this.generateTroubleshootingUserCredentials(
      this.selectedItems, environment.platformType);

    this.populateSession(this.selectedItems, teamEmails, assignedUserNames, this.enteredEmails,
                         environment.platformType, teamTroubleshootingUserCredentials,
                         individualTroubleshootingUserCredentials, this.createUserOnWlvm);

    await this.populateTimePeriod();
    const listOfActiveSessionsOnDeployment: Session[] =
      await this.deploymentSessionService.checkSessionsOnDeployment(this.session.deploymentId);

    let areSessionPreStepsSuccessful = true;

    if (listOfActiveSessionsOnDeployment.length === 0) {
      this.updateDeploymentSessionCreatedProperty(environment);
      areSessionPreStepsSuccessful = await this.performSessionCreationPreSteps(
        environment, individualTroubleshootingUserCredentials,
        teamTroubleshootingUserCredentials);
    } else {
      areSessionPreStepsSuccessful = false;
      this.openErrorSnackBar(`ERROR: Session already exists for ${this.data.deploymentName}`);
    }

    if (areSessionPreStepsSuccessful) {
      this.createSession(environment, individualTroubleshootingUserCredentials,
                         teamTroubleshootingUserCredentials, this.createUserOnWlvm);
    }
  }

  private async performSessionCreationPreSteps(
    environment: Deployment, teamTroubleshootingCredentials: string[][],
    assignedUserTroubleshootingCredentials: string[][]): Promise<any> {
    if (environment.platformType === 'physical') {
      const passwordlessAccessVerified =
        await this.ensurePasswordlessConnectionWithEnvironment(environment);
      if (passwordlessAccessVerified) {
        const assignedUsersCreatedSuccessfully = await this.createTroubleshootingUserOnMsOrWlvm(
          assignedUserTroubleshootingCredentials);
        const teamUsersCreatedSuccessfully = await this.createTroubleshootingUserOnMsOrWlvm(
          teamTroubleshootingCredentials);
        if (assignedUsersCreatedSuccessfully && teamUsersCreatedSuccessfully) {
          return true;
        }
        await this.deleteTroubleshootingUserOnMsOrWlvm(assignedUserTroubleshootingCredentials);
        await this.deleteTroubleshootingUserOnMsOrWlvm(teamTroubleshootingCredentials);
        return false;
      }
      return false;
    }
    return true;
  }

  private async ensurePasswordlessConnectionWithEnvironment(environment: Deployment): Promise<any> {
    let passwordlessAccessVerified = true;
    this.createSessionStepDescription =
    'Ensuring we have passwordless connection to the environment...';
    await this.ansibleService.ensurePasswordlessConnectionToEnvironment(this.data.deploymentName,
                                                                        this.createUserOnWlvm)
      .toPromise()
      .catch(() => {
        passwordlessAccessVerified = false;
        const message =
            `Failed when ensuring passwordless connection to
            environment: ${this.data.deploymentName}`;
        this.handleIfAnsibleFailed(message, environment);
      });
    return passwordlessAccessVerified;
  }

  private async createTroubleshootingUserOnMsOrWlvm(troubleshootingUserCredentials: string[][]):
    Promise<any> {
    if (troubleshootingUserCredentials[0].length > 0) {
      this.createSessionStepDescription = 'Creating troubleshooting user on MS';
      const troubleshootingUsernames = troubleshootingUserCredentials[0];
      const troubleshootingPasswords = troubleshootingUserCredentials[1];

      for (const username in troubleshootingUsernames) {
        await this.ansibleService.createUserInMsOrWlvm(this.data.deploymentName,
                                                       troubleshootingUsernames[username],
                                                       troubleshootingPasswords[username],
                                                       MS)
        .toPromise()
        .catch((err) => {
          return false;
        });
        if (this.createUserOnWlvm) {
          await this.ansibleService.createUserInMsOrWlvm(this.data.deploymentName,
                                                         troubleshootingUsernames[username],
                                                         troubleshootingPasswords[username],
                                                         WLVM)
          .toPromise()
          .catch((err) => {
            return false;
          });
        }
      }
    }
    return true;
  }

  private async deleteTroubleshootingUserOnMsOrWlvm(troubleshootingUserCredentials: string[][]):
    Promise<any> {
    let message = '';
    const troubleshootingUsernames = troubleshootingUserCredentials[0];
    for (const username in troubleshootingUsernames) {
      await this.ansibleService.deleteUserFromMsOrWlvm(this.data.deploymentName,
                                                       troubleshootingUsernames[username], MS)
      .toPromise()
      .catch(() => {
        message =
          `Failed to delete user ${
            troubleshootingUsernames[username]} on the MS of: ${this.data.deploymentName}`;
        setTimeout(() => this.openErrorSnackBar(message), 7000);
      });

      await this.ansibleService.deleteUserFromMsOrWlvm(this.data.deploymentName,
                                                       troubleshootingUsernames[username], WLVM)
      .toPromise()
      .catch(() => {
        message =
          `Failed to delete user ${
            troubleshootingUsernames[username]} on the WLVM of: ${this.data.deploymentName}`;
        setTimeout(() => this.openErrorSnackBar(message), 7000);
      });
    }
  }

  private handleIfAnsibleFailed(message: string, environment: Deployment): void {
    const additionalTags = {
      signum: this.signum,
      environment: this.data.deploymentName,
    };
    this.angularLogger.info(message, additionalTags);
    this.closeDialogModal();
    this.updateDeploymentSessionCreatedProperty(environment);
    this.openErrorSnackBar(message);
  }

  private createSession(environment: Deployment, assignedUserCredentials: string[][],
                        assignedTeamCredentials: string[][], createUserOnWlvm : boolean): void {
    this.createSessionStepDescription = 'Creating session...';
    const additionalTags = {
      signum: this.signum,
      environment: this.data.deploymentName,
    };
    this.deploymentSessionService.createSession(this.session)
      .subscribe(
        async (createdSession) => {
          await this.deploymentSessionService.beginTimePeriod(this.timePeriod, createdSession);
          await this.deploymentSessionService
            .sendEmail(createdSession, this.data.deploymentTestPhase, createUserOnWlvm);
          const hiddenUserPasswords = this.setSessionPasswordsToBlank(assignedUserCredentials[1]);
          const hiddenTeamPasswords = this.setSessionPasswordsToBlank(assignedTeamCredentials[1]);
          if (createdSession.sessionPassword) {
            createdSession.sessionPassword['teamPassword'] = hiddenTeamPasswords;
            createdSession.sessionPassword['individualPassword'] = hiddenUserPasswords;
          }
          additionalTags['created'] = createdSession;
          this.angularLogger.info(
            `Session created by ${this.signum} on ${this.data.deploymentName}`,
            additionalTags);
          this.openSnackBar(`Session created for: ${this.data.deploymentName}`);
          this.closeDialogModal();
        },
        (error) => {
          this.deleteTroubleshootingUserOnMsOrWlvm(assignedUserCredentials);
          this.deleteTroubleshootingUserOnMsOrWlvm(assignedTeamCredentials);
          const message = `Failed to create session on ${this.data.deploymentName}`;
          this.angularLogger.info(message, additionalTags);
          this.updateDeploymentSessionCreatedProperty(environment);
          this.closeDialogModal();
          this.openErrorSnackBar(message);
        },
      );
  }

  private setSessionPasswordsToBlank(passwordsToSetToBlank: string[]): any {
    for (const password in passwordsToSetToBlank) {
      passwordsToSetToBlank[password] = '*****';
    }
    return passwordsToSetToBlank;
  }

  private updateDeploymentSessionCreatedProperty(environment: Deployment): void {
    environment.isSessionCreated = !environment.isSessionCreated;
    environment._id = environment['deploymentId'];
    environment.name = this.data.deploymentName;
    this.deploymentService.updateDeployment(environment).toPromise();
  }

  private closeDialogModal(): void {
    this.dialogRef.close();
  }

  private populateTimePeriod(): void {
    this.timePeriod.durationHours = this.hours;
    this.timePeriod.durationMinutes = this.minutes;
  }

  private setTimeToZeroIfNull(): void {
    if (this.hours == null) {
      this.hours = 0;
    } else if (this.minutes == null) {
      this.minutes = 0;
    }
  }

  private populateSession(assignedTeam: string[], teamEmail: string[],
                          assignedUserNames: string[], assignedUserEmails: string[],
                          platformType, teamTroubleshootingUserCredentials: string[][],
                          individualTroubleshootingUserCredentials: string[][],
                          createUserOnWlvm: boolean): void {
    let troubleshootingUsernames;
    let troubleshootingPasswords;
    if (platformType === 'physical') {
      troubleshootingUsernames = {
        assignedTeamUsername: teamTroubleshootingUserCredentials[0],
        assignedUserUsername: individualTroubleshootingUserCredentials[0],
      };
      troubleshootingPasswords = {
        assignedTeamPassword: teamTroubleshootingUserCredentials[1],
        assignedUserPassword: individualTroubleshootingUserCredentials[1],
      };
    } else {
      troubleshootingUsernames = {};
      troubleshootingPasswords = {};
    }
    this.session.deploymentId = this.data.deploymentId;
    this.session.deploymentName = this.data.deploymentName;
    this.session.assignedTeam = assignedTeam;
    this.session.teamEmail = teamEmail;
    this.session.assignedUserNames = assignedUserNames;
    this.session.assignedUserEmails = assignedUserEmails;
    this.session.hours = this.hours;
    this.session.minutes = this.minutes;
    this.session.jira = this.convertJiraStringToArray();
    this.session.sessionUsername = troubleshootingUsernames;
    this.session.sessionPassword = troubleshootingPasswords;
    this.session.createUserOnWlvm = createUserOnWlvm;
  }

  private generateTroubleshootingUserCredentials(
    sessionAssignees: string[], environmentType: string): any[] {
    if (environmentType === 'physical') {
      const maxLinuxUsernameLength = 32;
      const assigneeUsernames: string[] = [];
      const assigneePasswords: string[] = [];

      for (const sessionAssignee in sessionAssignees) {
        let troubleshootingUsername =
          `${sessionAssignees[sessionAssignee]}_${
          Math.random().toString(36).slice(-8)}`;
        troubleshootingUsername = troubleshootingUsername.replace(/\s|\W/g, '');
        if (troubleshootingUsername.length > maxLinuxUsernameLength) {
          troubleshootingUsername = troubleshootingUsername.substring(
            (troubleshootingUsername.length - 1) - maxLinuxUsernameLength,
            troubleshootingUsername.length - 1);
        }
        assigneeUsernames.push(troubleshootingUsername);
        assigneePasswords.push(Math.random().toString(36).slice(-8));
      }
      return [assigneeUsernames, assigneePasswords];
    }
    return [];
  }

  private convertJiraStringToArray(): string[] {
    return this.parseInsertedJiras(this.jira.replace(/ /g, '').split(','));
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

  private retrieveTeamsEmailList(assignedTeam): string[] {
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

  private fetchIndividualNamesFromEmails(assignedEmails): string[] {
    const individualNameList = [];
    for (const assignedEmail of assignedEmails) {
      const fullName = assignedEmail.split('@')[0].split('.');
      const firstName = fullName[0][0].toUpperCase() + fullName[0].slice(1);
      const lastName = fullName[fullName.length - 1][0].toUpperCase()
       + fullName[fullName.length - 1].slice(1);
      individualNameList.push(`${firstName} ${lastName}`);
    }
    return individualNameList;
  }

  private getTeamsInfo(): void {
    this.inventoryService.getTeamsInfoFromTeamInventoryTool()
      .subscribe(
        (teamsInfo) => {
          this.populateTeamsWithEmail(teamsInfo['items']);
        },
        (error) => {
          this.inventoryService.getTeamsInfoFromDatabase()
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

  private removeUserEmail(email: string): void {
    const indexOfEnteredUserEmails = this.enteredEmails.indexOf(email);

    if (indexOfEnteredUserEmails >= 0) {
      this.enteredEmails.splice(indexOfEnteredUserEmails, 1);
      this.sessionForm.patchValue({ enteredEmails: this.enteredEmails });
    }
  }
}
