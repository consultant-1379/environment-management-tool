import { Component, OnInit, Input } from '@angular/core';

import { DeploymentService } from '../../services/deployments.service';
import { Deployment } from '../../models/deployment';
import { EventsService } from '../../services/event.service';
import { keyCloakUser } from './../../utils/app-init';
import { Logger } from './../../services/logging.service';

@Component({
  selector: 'deployment-other-info',
  templateUrl: './deployment-other-info.component.html',
  styleUrls: ['./deployment-other-info.component.css'],
})
export class DeploymentOtherInfoComponent implements OnInit {
  @Input() deployment: Deployment;
  @Input() checkUserPermissions: boolean;
  isEditable: boolean = false;
  isExpandButtonHidden: boolean = false;
  isResizeButtonHidden: boolean = true;

  constructor(
    private deploymentService: DeploymentService,
    private eventsService: EventsService,
    private angularLogger: Logger,
  ) { }

  ngOnInit() {
    this.checkIfOtherInfoUndefined();
  }

  private checkIfOtherInfoUndefined(): void {
    this.deployment.otherInfo =
      this.deployment.otherInfo === undefined ? '' : this.deployment.otherInfo;
  }

  editTextArea(textField: any): void {
    this.isExpandButtonHidden = true;
    this.isResizeButtonHidden = true;
    this.eventsService.sendMessage('editing');
    this.isEditable = true;
    this.autoGrowTextArea(textField);
  }

  changeButtonTypeAndSaveCurrentInfo(otherInfo: string, textField: any): void {
    this.eventsService.sendMessage('finished editing');
    if (this.isEditable === true) {
      this.isResizeButtonHidden = false;
      this.saveOtherInfo(otherInfo);
    }
    this.isEditable = false;
  }

  private saveOtherInfo(otherInfo: string): void {
    if (otherInfo === '') {
      // We need to give the blank space if the textarea is empty
      // Otherwise it wont ne persisted into the data and it will see nothing
      // tslint:disable-next-line
      otherInfo = ' ';
    }
    const keycloakUsername = keyCloakUser.getUsername();
    const additionalTags = {
      otherInfo: { otherInfo },
      signum: keycloakUsername,
      environment: this.deployment.name,
    };
    const message =
    `Other info updated to ${otherInfo} on ${this.deployment.name} by ${keycloakUsername}`;
    this.angularLogger.info(message, additionalTags);
    this.deploymentService.updateDeploymentOtherInfo(this.deployment, otherInfo).subscribe();

  }

  autoGrowTextArea(textField: any): void {
    if (textField.clientHeight < textField.scrollHeight) {
      textField.style.height = `${textField.scrollHeight}px`;
      if (textField.clientHeight < textField.scrollHeight) {
        const newHeight = textField.scrollHeight * 2 - textField.clientHeight;
        textField.style.height = `${newHeight}px`;
      }
    }
  }

  autoGrowTextAreaFromButton(textField: any): void {
    this.autoGrowTextArea(textField);
    this.isExpandButtonHidden = true;
    this.isResizeButtonHidden = false;
  }

  resetTextArea(textField: any): void {
    textField.style.height = '24px';
    this.isExpandButtonHidden = false;
    this.isResizeButtonHidden = true;
  }
}
