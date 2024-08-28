import { Component,  Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { DeploymentInformationModal } from
  '../deployment-info/deployment-information-modal.component';

@Component({
  selector: 'deployment-information',
  templateUrl: 'deployment-information.component.html',
  styleUrls: ['./deployment-information.component.css'],
})

export class DeploymentInformation {

  @Input() checkUserPermissions: boolean;
  @Input() deploymentInfo: any;
  constructor(public dialog: MatDialog) { }

  openDeploymentInfoModal(): void {
    this.dialog.open(DeploymentInformationModal, {
      panelClass: 'custom-modal-class',
      width: '40%',
      height: '75%',
      data: {
        deployment: this.deploymentInfo,
        checkUserPermissions: this.checkUserPermissions,
      },
    });
  }
}
