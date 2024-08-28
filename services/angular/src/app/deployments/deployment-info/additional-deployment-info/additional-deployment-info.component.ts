import { Component, Input, Inject, EventEmitter, Output } from '@angular/core';
import { Deployment, AdditionalDeploymentInfo } from '../../../models/deployment';
import { DeploymentService } from '../../../services/deployments.service';

@Component({
  selector: 'deployment-info-input-box',
  templateUrl: './additional-deployment-info.component.html',
  styleUrls: ['./additional-deployment-info.component.css'],
})

export class AdditionalDeploymentInfoComponent {

  @Input() deploymentData: Deployment;
  @Input() checkUserPermissions: boolean;
  @Output() updatedDeployment: EventEmitter<Deployment> = new EventEmitter;

  isEditable: boolean = false;
  isUserEditing: boolean = false;

  constructor(
    private deploymentService: DeploymentService,
  ) { }

  ngOnInit() {
  }

  public changeButtonTypeAndSaveCurrentInfo() {
    if (!this.isEditable) {
      this.isEditable = true;
      this.isUserEditing = true;
    }
  }

  public updateAdditionalInfo(additionalInfo: string) {
    this.updateDeploymentData(additionalInfo);
    this.isEditable = false;
    this.isUserEditing = false;
  }

  private updateDeploymentData(deploymentAdditionalInfo: string) {
    const deploymentToUpdate = new Deployment;
    deploymentToUpdate._id = this.deploymentData._id;
    deploymentToUpdate.additionalDeploymentInfo.additionalText = deploymentAdditionalInfo;
    this.deploymentService.updateDeployment(deploymentToUpdate).subscribe((deployment) => {
      this.updatedDeployment.emit(deployment);
    });
  }
}
