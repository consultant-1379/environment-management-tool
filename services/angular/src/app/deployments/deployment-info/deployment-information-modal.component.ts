import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs';

import { DitService } from '../../services/dit.service';
import { DttService } from '../../services/dtt.service';
import { DmtService } from '../../services/dmt.service';

@Component({
  selector: 'deployment-information-modal',
  templateUrl: 'deployment-information-modal.component.html',
  styleUrls: ['./deployment-information-modal.component.css'],
})

export class DeploymentInformationModal {

  DIT_URL: string = 'https://atvdit.athtem.eei.ericsson.se/';
  DTT_URL: string = 'https://atvdtt.athtem.eei.ericsson.se/';
  ENM_DDP_URL: string = '.athtem.eei.ericsson.se/php/index.php?site=LMI_';
  PHYSICAL_DDP_URL: string = '.athtem.eei.ericsson.se/php/index.php?site=LMI_ENM';
  CIFWK_URL: string = 'https://ci-portal.seli.wh.rnd.internal.ericsson.com';

  @Input() deploymentLink;
  @Input() deploymentDttLink;
  @Input() deploymentDdpLink;
  @Input() deploymentEnmGuiLink;
  @Input() deploymentWorkflowsLink;
  @Input() deploymentHorizonLink;
  @Input() nrmVersion;
  @Input() nrmSize;
  @Input() nssProductSetVersion;
  @Input() nodeTypes;
  @Input() nodeVersions;
  @Input() deploymentDescription: Observable<any>;
  @Input() cbConsole;
  @Input() gotAllCloudDetails;
  @Input() gotAllPhysicalDetails;
  @Input() checkUserPermissions: boolean;
  constructor(
    public dialogRef: MatDialogRef<DeploymentInformationModal>,
    private ditService: DitService,
    private dttService: DttService,
    private dmtService: DmtService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    if (this.data.deployment.platformType === 'physical') {
      this.gotAllPhysicalDetails = false;
      this.physicalDeploymentInfoSetup();
    } else if (this.data.deployment.platformType === 'vENM' ||
               this.data.deployment.platformType === 'SIENM') {
      this.gotAllCloudDetails = false;
      this.vEnmDeploymentInfoSetup();
    } else if (this.data.deployment.platformType === 'cENM') {
      this.gotAllCloudDetails = false;
      this.cEnmDeploymentInfoSetup();
    }

    if (this.data.deployment.testPhase === 'RNL') {
      this.getNodeDetails();
    } else {
      this.getNetsimDetails();
    }
  }

  async vEnmDeploymentInfoSetup() {
    const deploymentDocument =
      await this.ditService.getDeploymentDocument(this.data.deployment.name);
    const deploymentId = await this.ditService.getDeploymentId(deploymentDocument);
    this.deploymentLink = `${this.DIT_URL}deployments/view/${deploymentId}`;
    this.getDdpLink(await this.getDdpDocument(deploymentDocument));
    this.getVnfLink(await this.getVnfDocument(deploymentDocument));
    this.getEnmGuiLink(await this.getSedDocument(deploymentDocument));
    this.getHorizonGuiLink(await this.getVnfDocument(deploymentDocument));
    this.gotAllCloudDetails = true;
  }

  async cEnmDeploymentInfoSetup() {
    const deploymentDocument =
      await this.ditService.getDeploymentDocument(this.data.deployment.name);
    const deploymentId = await this.ditService.getDeploymentId(deploymentDocument);
    this.deploymentLink = `${this.DIT_URL}deployments/view/${deploymentId}`;
    const deploymentDttDocument =
      await this.dttService.getCenmDeploymentDocument(this.data.deployment.name);
    const deploymentDttId = await this.dttService.getCenmDeploymentId(deploymentDttDocument);
    this.deploymentDttLink = `${this.DTT_URL}deployments/view/${deploymentDttId}`;
    this.getCenmDdpLink(await this.getCenmDdpDocument(deploymentDocument));
    this.getEnmGuiLink(await this.getSedDocument(deploymentDocument));
    this.gotAllCloudDetails = true;
  }

  private async physicalDeploymentInfoSetup() {
    this.deploymentLink = await this.dmtService.getDeploymentDmtLink(this.data.deployment.name);
    await this.getDeploymentDescription();
    await this.getDeploymentHttpdFqdn();
    await this.getDeploymentDdpSite();
    this.gotAllPhysicalDetails = true;
  }

  private getNetsimDetails(): void {
    this.nrmVersion = this.data.deployment.nrmVersion;
    this.nrmSize = this.data.deployment.nrmSize;
    this.nssProductSetVersion = this.data.deployment.nssProductSetVersion;
  }

  private getNodeDetails(): void {
    this.nodeTypes = this.data.deployment.nodeTypes;
    this.nodeVersions = this.data.deployment.nodeVersions;
  }

  private async getDeploymentDescription() {
    const deploymentDescription =
      await this.dmtService.getDeploymentDescription(this.data.deployment.name).toPromise();
    this.deploymentDescription =
      deploymentDescription['deployment_description_data']['auto_deployment'];
  }

  private async getDeploymentHttpdFqdn() {
    const deploymentHttpdFqdn =
      await this.dmtService.getDeploymentHttpdFqdn(this.data.deployment.name).toPromise();
    for (const key in deploymentHttpdFqdn) {
      const deploymentHttpdFqdnArray =
        deploymentHttpdFqdn[key]['nodes'];
      for (const name in deploymentHttpdFqdnArray) {
        if (deploymentHttpdFqdnArray[name]['group'] === 'haproxy') {
          this.deploymentEnmGuiLink =
            `https://${deploymentHttpdFqdnArray[name]['interfaces'][0]['ipv4']}`;
        }
      }
    }
  }

  private async getDeploymentDdpSite() {
    const deploymentDdpSite =
      await this.dmtService.getDeploymentDdpSite(this.data.deployment.name).toPromise();
    const deploymentDdpSiteProperty =
      deploymentDdpSite.ddp_hostname;
    this.deploymentDdpLink =
      `https://${deploymentDdpSiteProperty}${this.PHYSICAL_DDP_URL}${this.data.deployment.name}`;
  }

  private getDdpLink(deploymentDdpDocument): void {
    const deploymentDdpSite = deploymentDdpDocument['content']['hostname'];
    this.deploymentDdpLink =
      `https://${deploymentDdpSite}${this.ENM_DDP_URL}${this.data.deployment.name}`;
  }

  private getCenmDdpLink(deploymentDdpDocument): void {
    const deploymentDdpSite = deploymentDdpDocument['content']['global']['ddp_hostname'];
    const nameSpace = deploymentDdpDocument['content']['global']['namespace'];
    this.deploymentDdpLink =
      `https://${deploymentDdpSite}${this.ENM_DDP_URL}${this.data.deployment.name}_${nameSpace}`;
  }

  private getVnfLink(deploymentVnfDocument): void {
    let deploymentWorkflowsSite = '';
    if (deploymentVnfDocument['ha'] === true) {
      deploymentWorkflowsSite =
        deploymentVnfDocument['content']['parameters']['external_ipv4_vip_for_services'];
    } else {
      deploymentWorkflowsSite =
        deploymentVnfDocument['content']['parameters']['external_ipv4_for_services_vm'];
    }
    this.deploymentWorkflowsLink = `http://${deploymentWorkflowsSite}/index.html#workflows`;
  }

  private getEnmGuiLink(deploymentSedDocument): void {
    const deploymentEnmGuiSite = deploymentSedDocument['content']['parameters']['httpd_fqdn'];
    this.deploymentEnmGuiLink = `https://${deploymentEnmGuiSite}`;
  }

  private getHorizonGuiLink(deploymentVnfDocument): void {
    const deploymentHorizonSite = deploymentVnfDocument['content']['parameters']['vim_HostName'];
    this.deploymentHorizonLink = `http://${deploymentHorizonSite}`;
  }

  private async getDdpDocument(deploymentDocument: object) {
    const deploymentDdpId = await this.ditService.getDeploymentDdpId(deploymentDocument);
    return await this.ditService.getDeploymentAssociatedDocument(deploymentDdpId);
  }

  private async getCenmDdpDocument(deploymentDocument: object) {
    const deploymentDdpId = await this.ditService.getCenmDeploymentDdpId(deploymentDocument);
    return await this.ditService.getDeploymentAssociatedDocument(deploymentDdpId);
  }

  private async getSedDocument(deploymentDocument: object) {
    const deploymentSedId = await this.ditService.getDeploymentSedId(deploymentDocument);
    const deploymentSedDocument = await this.ditService.getDeploymentSedDocument(deploymentSedId);
    return deploymentSedDocument;
  }

  private async getVnfDocument(deploymentDocument: object) {
    const deploymentVnfId =
      await this.ditService.getDeploymentVnfId(deploymentDocument);
    const deploymentVnfDocument =
      await this.ditService.getDeploymentAssociatedDocument(deploymentVnfId);
    return deploymentVnfDocument;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  copyAllInfo(platformType, clipboardContent: object): void {
    let clipboard = '';
    let modalDetails = [];
    const vEnmModalDetails =
      ['DIT Link: ', 'DDP Link: ', 'ENM GUI Link: ', 'Workflows Link: ', 'Horizon GUI Link: '];
    const cEnmModalDetails =
      ['DIT Link: ', 'DTT Link: ', 'DDP Link: ', 'ENM GUI Link: '];
    const physicalModalDetails = ['DMT Link: ', 'ENM GUI Link: ', 'DDP Link: '];
    if (platformType === 'vENM') {
      modalDetails = vEnmModalDetails;
    } else if (platformType === 'cENM') {
      modalDetails = cEnmModalDetails;
    } else if (platformType === 'physical') {
      modalDetails = physicalModalDetails;
    }
    for (const infoElement in modalDetails) {
      clipboard += `${modalDetails[infoElement]}${clipboardContent[infoElement]}\n`;
    }
    this.createTempTextBox(clipboard);
  }

  private createTempTextBox(clipboard: string) {
    const tempTextBox = document.createElement('textarea');
    tempTextBox.style.position = 'fixed';
    tempTextBox.style.left = '0';
    tempTextBox.style.top = '0';
    tempTextBox.style.opacity = '0';
    tempTextBox.value = clipboard.toString();
    document.body.appendChild(tempTextBox);
    tempTextBox.focus();
    tempTextBox.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextBox);
  }

  closeDialogModal() {
    this.dialogRef.close();
  }
}
