import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { SessionCredentialModalComponent } from './session-credential-modal.component';

@Component({
  selector: 'session-credentials',
  template: `
  <div *ngIf="sessionUsernames; else noCredentials">
    <a href="#">
      <span (mousedown)="openSessionCredentialsModal();">
        Reveal
      </span>
      <span class="reveal-icon-properties material-icons"
        (mousedown)="openSessionCredentialsModal();">
        visibility
      </span>
    </a>
  </div>
  <ng-template #noCredentials>
      <span>
        No Credentials
      </span>
  </ng-template>`,
  styleUrls: ['./session-credential-modal.component.css'],
})

export class DynamicSessionCredentialInfoComponent {
  @Input() sessionUsernames: String;
  @Input() sessionPasswords: String;
  @Input() assignedTeams: String;
  @Input() assignedUserNames: String;

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() { }

  openSessionCredentialsModal(): void {
    this.dialog.open(SessionCredentialModalComponent, {
      panelClass: 'custom-modal-class',
      width: '90vw',
      height: 'auto',
      data: {
        sessionUsernames: this.sessionUsernames,
        sessionPasswords: this.sessionPasswords,
        assignedTeams: this.assignedTeams,
        assignedUserNames: this.assignedUserNames,
      },
    });
  }
}
