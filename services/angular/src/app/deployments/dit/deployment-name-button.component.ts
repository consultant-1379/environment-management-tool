import { Component, Input } from '@angular/core';

@Component({
  selector: 'link-to-dit',
  template: `<a href="#" id="{{this.deploymentName}}" (mousedown)="openDit();">
                {{this.deploymentName}}
             </a>`,
})

export class NameButtonComponent {

  @Input() deploymentName:string = '';
  openDit() {
    const blankWindow = window.open('', '_blank');
    const ditUrl = 'https://atvdit.athtem.eei.ericsson.se/';
    const clickedDeploymentName = event.srcElement.id;
    const ditRestCall = ditUrl + 'api/deployments/?q=name=' + clickedDeploymentName;

    fetch(ditRestCall)
      .then(res => res.json())
      .then((clickedDeploymentsJson) => {
        const deploymentId = clickedDeploymentsJson[0]._id;
        const ditLinkToClickedDeployment = ditUrl + 'deployments/view/' + deploymentId;
        blankWindow.location.href = ditLinkToClickedDeployment;
      })
      .catch((err) => {
        console.log('Error opening DIT link for ' + clickedDeploymentName);
        throw err;
      });
  }
}
