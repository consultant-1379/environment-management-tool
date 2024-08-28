export class Session {
  deploymentId: string;
  deploymentName: string;
  assignedTeam: string[];
  teamEmail: string[];
  assignedUserNames: string[];
  assignedUserEmails: string[];
  hours: number;
  minutes: number;
  status: string;
  sessionUsername: Object;
  sessionPassword: Object;
  expires: string;
  timePeriodId: string;
  /* tslint:disable */
  // disabling the tslint rule: variable name must be in lowerCamelCase or UPPER_CASE
  // We need to use the _id to match with the _id created by mongoose
  _id: string;
  /* tslint:enable */
  startTime: Date;
  endTime: Date;
  jira: string[];
  createUserOnWlvm: boolean;
}
