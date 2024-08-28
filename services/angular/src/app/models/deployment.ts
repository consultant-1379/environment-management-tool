/* tslint:disable:variable-name */
export class Deployment {
  name: string;
  state: string;
  assignedJob: string;
  jobName: string;
  testPhase: string;
  productSet: string;
  deploymentType: string;
  _id: string;
  additionalDeploymentInfo = new AdditionalDeploymentInfo();
  systemHealthCheckStatus: string;
  deploymentRefreshStatus: string;
  deploymentUpgradeStatus: string;
  deploymentRollbackStatus: string;
  otherInfo: string;
  isSessionCreated: boolean;
  platformType: string;
  blades: string;
  ddp: string;
  vFarms: string;
  pod: string;
  workloadVm: string;
  firmware: string;
  sanHost: string;
  sanShared: string;
  nasHost: string;
  nasShared: string;
  nasSoftware: string;
  hardwareType: string;
  freeIp: string;
  deploymentDescription: string;
  externalNfs: string;
  openstackVersion: string;
  ccdVersion: string;
  nameSpace: string;
  clusterNodes: string;
}

export class AdditionalDeploymentInfo {
  additionalText: string;
  dateModified: string;
}
