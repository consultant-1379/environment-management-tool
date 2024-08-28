import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'session-credential-modal',
  templateUrl: './session-credential-modal.component.html',
  styleUrls: ['./session-credential-modal.component.css'],
})
export class SessionCredentialModalComponent {
  public sessionUsernames: String[];
  public assignedTeams: String[];
  public sessionPasswords: String[];
  public assignedUserNames: String[];
  public sessionCredentialDynamicDataSource: MatTableDataSource<any>;
  public displayedColumns: string[] =
  ['sessionAssignees', 'sessionUsernames', 'sessionPasswords'];

  constructor(
    public dialogRef: MatDialogRef<SessionCredentialModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
   ) {}

  ngOnInit() {
    this.sessionUsernames = this.data.sessionUsernames;
    this.sessionPasswords = this.data.sessionPasswords;
    this.assignedTeams = this.data.assignedTeams;
    this.assignedUserNames = this.data.assignedUserNames;

    const sessionAssignees: String[] = this.assignedTeams.concat(this.assignedUserNames);
    const sessionUsernames: String[] =
      this.sessionUsernames['assignedTeamUsername']
        .concat(this.sessionUsernames['assignedUserUsername']);
    const sessionPasswords: String[] =
      this.sessionPasswords['assignedTeamPassword']
        .concat(this.sessionPasswords['assignedUserPassword']);

    this.sessionCredentialDynamicDataSource = new MatTableDataSource([]);

    for (const sessionAssignee in sessionAssignees) {
      this.sessionCredentialDynamicDataSource.data.push({
        assignedTeams: sessionAssignees[sessionAssignee],
        sessionUsernames: sessionUsernames[sessionAssignee],
        sessionPasswords: sessionPasswords[sessionAssignee],
      });
    }
  }

  closeDialogModal(): void {
    this.dialogRef.close();
  }
}
