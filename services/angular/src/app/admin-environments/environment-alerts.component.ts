import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

@Component({
  selector: 'env-alerts',
  templateUrl: './environment-alerts.component.html',
})
export class EnvironmentAlertsComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
}
