import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'confirm-edit',
  templateUrl: './confirm-edit-environment.component.html',
  styleUrls: ['./confirm-edit-environment.component.css'],
})

export class ConfirmEditEnvironmentComponent {

  private confirmedEnvironment: string = '';
  private editConfirmEnvironmentForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.setupConfirmedEnvironmentForm();
  }

  private setupConfirmedEnvironmentForm(): void {
    this.editConfirmEnvironmentForm = this.formBuilder.group(
      {
        confirmedEnvironment: '',
      },
      {
        validator: (formControl) => {
          const confirmedEnvironmentCtrl = formControl.controls.confirmedEnvironment;
          if (confirmedEnvironmentCtrl.value !== this.data.environmentToEditName) {
            return { invalid: true };
          }
        },
      });
  }
}
