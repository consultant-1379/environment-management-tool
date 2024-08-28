import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CreateButtonComponent } from './create-button.component';
import { Deployment } from '../../models/deployment';

@Component({
  selector: 'create-session',
  template: `
  <button mat-menu-item (click)="openCreateSessionForm();">
    <mat-icon>group_add</mat-icon>
    Create Session
  </button>
`,
})

export class CreateSessionButtonComponent {

  @Input() deploymentInfo: Deployment;
  constructor(public dialog: MatDialog) {}

  openCreateSessionForm(): void {
    const dialogRef = this.dialog.open(CreateButtonComponent, {
      width: '35%',
      disableClose: true,
      data: {
        deploymentId: this.deploymentInfo._id,
        deploymentName: this.deploymentInfo.name,
        deploymentTestPhase: this.deploymentInfo.testPhase,
        platformType: this.deploymentInfo.platformType,
      },
    });
  }
}
