import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'confirm-remove',
  templateUrl: './confirm-remove-environment.component.html',
  styleUrls: ['./confirm-remove-environment.component.css'],
})

export class ConfirmRemoveEnvironmentComponent {

  private confirmedEnvironment: string = '';
  private removeConfirmEnvironmentForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.removeConfirmEnvironmentForm = this.formBuilder.group(
      {
        confirmedEnvironment: '',
      },
      {
        validator: (formControl) => {
          const confirmedEnvironmentCtrl = formControl.controls.confirmedEnvironment;
          if (confirmedEnvironmentCtrl.value !== this.data.environmentToRemove) {
            return { invalid: true };
          }
        },
      },
    );
  }
}
