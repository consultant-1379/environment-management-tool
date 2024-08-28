import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'confirm-autoshc',
  templateUrl: './confirm-autotriggershc.component.html',
  styleUrls: ['./confirm-autotriggershc.component.css'],
})

export class ConfirmAutoTriggerSHC {

  private confirmedEnvironment: string = '';
  private confirmAutoTriggerShcForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.setupConfirmedEnvironmentForm();
  }

  private setupConfirmedEnvironmentForm(): void {
    this.confirmAutoTriggerShcForm = this.formBuilder.group(
      {
        confirmedEnvironment: '',
      });
  }
}
