import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import 'rxjs/add/operator/map';

import { DeploymentService } from '../services/deployments.service';
import { Deployment } from '../models/deployment';
import { DitService } from '../services/dit.service';
import { DmtService } from '../services/dmt.service';
import { EventsService } from '../services/event.service';
import { WebsocketService } from '../services/websocket-service';
import { environment } from 'environments/environment';

@Component({
  templateUrl: './armory.component.html',
  styleUrls: ['./armory.component.css'],
})

export class ArmoryComponent implements OnInit {

  ioConnection: any;
  private listOfSupportedTestPhases: string[] = [
    'MTE', 'CDL', 'LongLoop', 'DROPBACK', 'PLM', 'RVB', 'STKPI', 'RNL', 'ENDURANCE', 'TEaaS', 'RTD',
    'SprintValidation', 'CS',
  ];

  private environmentsPlatformToDisplay: string;
  private mteEnvironmentsDataSource: MatTableDataSource<Deployment> = new MatTableDataSource();
  private mtvEnvironmentsDataSource: MatTableDataSource<Deployment> = new MatTableDataSource();
  private srEnvironmentsDataSource: MatTableDataSource<Deployment> = new MatTableDataSource();
  private otherEnvironmentsDataSource: MatTableDataSource<Deployment> = new MatTableDataSource();

  private mteEnvironmentsSubscription: Subscription;
  private mtvEnvironmentsSubscription: Subscription;
  private srEnvironmentSubscription: Subscription;
  private otherEnvironmentsSubscription: Subscription;

  private environmentSubject = new Subject<string>();
  private allEnvironmentSubject = new Subject<string>();

  displayPhysicalColumns: string[] = [
    'name', 'testPhase', 'productSet', 'deploymentType', 'ddp',
    'vFarms', 'nrmSize', 'nrmVersion', 'pod', 'workloadVm',
    'blades', 'firmware', 'san', 'nas', 'hardwareType', 'freeIp', 'deploymentDescription',
  ];
  displayvENMAndSIENMColumns: string[] = [
    'name', 'testPhase', 'productSet', 'deploymentType', 'ddp',
    'vFarms', 'nrmSize', 'nrmVersion', 'pod', 'workloadVm', 'externalNfs', 'openstack',
  ];
  displaycENMColumns: string[] = [
    'name', 'testPhase', 'productSet', 'deploymentType', 'ddp',
    'vFarms', 'nrmSize', 'nrmVersion', 'workloadVm', 'ccdVersion', 'nameSpace', 'clusterNodes',
  ];

  DIT_URL: string = 'https://atvdit.athtem.eei.ericsson.se/';
  ENM_DDP_URL: string = '.athtem.eei.ericsson.se/php/index.php?site=LMI_';
  PHYSICAL_DDP_URL: string = '.athtem.eei.ericsson.se/php/index.php?site=LMI_ENM';
  CIFWK_URL: string = 'https://ci-portal.seli.wh.rnd.internal.ericsson.com';

  dmtLink = new Map<string, string>();
  ditLink = new Map<string, string>();
  ddpLink = new Map<string, string>();

  @ViewChild('MTETable') mteSort: MatSort;
  @ViewChild('MTVTable') mtvSort: MatSort;
  @ViewChild('SRTable') srSort: MatSort;
  @ViewChild('otherTable') otherSort: MatSort;

  constructor(
    private deploymentService: DeploymentService,
    private ditService: DitService,
    private dmtService: DmtService,
    private eventsService: EventsService,
    private socketService: WebsocketService,
  ) { }

  ngOnInit() {
    this.environmentsPlatformToDisplay = 'vENM';
    this.eventsService.sendMessage('hideTestPhases');
    this.retrieveEnvironmentInfo();
    this.eventManager();
  }

  private applyFilter(filterValue: string): void {
    /* tslint:disable */
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    /* tslint:enable */
    this.mteEnvironmentsDataSource.filter = filterValue;
    this.mtvEnvironmentsDataSource.filter = filterValue;
    this.srEnvironmentsDataSource.filter = filterValue;
    this.otherEnvironmentsDataSource.filter = filterValue;
  }

  private changeDeploymentType(type: string): void {
    this.environmentsPlatformToDisplay = type;
    this.eventManager();
  }

  private retrieveEnvironmentInfo(): void {
    this.retrieveMTEEnvironments('MTE');
    this.retrieveMTVEnvironments('RVB%CDL%LongLoop%STKPI%RNL');
    this.retrieveSREnvironments('ENDURANCE%SprintValidation%PLM%DROPBACK');
    this.retrieveOtherEnvironments('RTD%TEaaS%CS');
  }

  private retrieveMTEEnvironments(testPhases: string): void {
    const mteEnvironments = this.environmentSubject.pipe(
      debounceTime(500),
      switchMap(type =>
        this.deploymentService.getDeploymentsByType(type, testPhases),
      ),
    );
    this.mteEnvironmentsSubscription = mteEnvironments.subscribe((returnedMTEEnvironments) => {
      this.mteEnvironmentsDataSource.data = returnedMTEEnvironments;
      this.retrieveDeploymentDescriptionInformation(this.mteEnvironmentsDataSource.data);
      this.mteEnvironmentsDataSource.sort = this.mteSort;
      this.editProductSetSortingAccessor(this.mteEnvironmentsDataSource);
    });
  }

  private retrieveMTVEnvironments(testPhases: string): void {
    const mtvEnvironments = this.environmentSubject.pipe(
      debounceTime(500),
      switchMap(type =>
        this.deploymentService.getDeploymentsByType(type, testPhases),
      ),
    );
    this.mtvEnvironmentsSubscription = mtvEnvironments.subscribe((returnedMTVEnvironments) => {
      this.mtvEnvironmentsDataSource.data = returnedMTVEnvironments;
      this.retrieveDeploymentDescriptionInformation(this.mtvEnvironmentsDataSource.data);
      this.mtvEnvironmentsDataSource.sort = this.mtvSort;
      this.editProductSetSortingAccessor(this.mtvEnvironmentsDataSource);
    });
  }

  private retrieveSREnvironments(testPhases: string): void {
    const srEnvironments = this.environmentSubject.pipe(
      debounceTime(500),
      switchMap(type =>
        this.deploymentService.getDeploymentsByType(type, testPhases),
      ),
    );
    this.srEnvironmentSubscription = srEnvironments.subscribe((returnedSREnvironments) => {
      this.srEnvironmentsDataSource.data = returnedSREnvironments;
      this.retrieveDeploymentDescriptionInformation(this.srEnvironmentsDataSource.data);
      this.srEnvironmentsDataSource.sort = this.srSort;
      this.editProductSetSortingAccessor(this.srEnvironmentsDataSource);
    });
  }

  private retrieveOtherEnvironments(testPhases: string): void {
    const otherEnvironments = this.environmentSubject.pipe(
      debounceTime(500),
      switchMap(type =>
        this.deploymentService.getDeploymentsByType(type, testPhases),
      ),
    );
    this.otherEnvironmentsSubscription =
      otherEnvironments.subscribe((returnedOtherEnvironments) => {
        this.otherEnvironmentsDataSource.data = returnedOtherEnvironments;
        this.retrieveDeploymentDescriptionInformation(this.otherEnvironmentsDataSource.data);
        this.otherEnvironmentsDataSource.sort = this.otherSort;
        this.editProductSetSortingAccessor(this.otherEnvironmentsDataSource);
      });
  }

  private editProductSetSortingAccessor(
    environmentMatTableDataSource: MatTableDataSource<Deployment>): void {
    environmentMatTableDataSource.sortingDataAccessor = (item, property) => {
      if (property === 'productSet') {
        let manipulatedProductSetVersion: string = '';
        let productSetVersionArray: string[] = [];
        const productSetVersion = item.productSet;

        if (!productSetVersion) {
          return 0;
        }

        productSetVersionArray = productSetVersion.split('.');
        if (productSetVersionArray[2].length === 1) {
          productSetVersionArray[2] = `00${productSetVersionArray[2]}`;
        } else if (productSetVersionArray[2].length === 2) {
          productSetVersionArray[2] = `0${productSetVersionArray[2]}`;
        }
        manipulatedProductSetVersion = productSetVersionArray.join('');
        return parseInt(manipulatedProductSetVersion, 10);
      }
      return item[property];
    };
  }

  async sleep(milliseconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(() => resolve(), milliseconds));
  }

  private getDdpHostname(deploymentDdpDocument: object): string {
    return deploymentDdpDocument['content']['hostname'];
  }

  private getCenmDdpHostname(deploymentDdpDocument: object): string {
    return deploymentDdpDocument['content']['global']['ddp_hostname'];
  }

  private getCenmDdpNamespace(deploymentDdpDocument: object): string {
    return deploymentDdpDocument['content']['global']['namespace'];
  }

  private async getDdpDocument(deploymentDocument: object) {
    const deploymentDdpId = this.ditService.getDeploymentDdpId(deploymentDocument);
    await this.sleep(1000);
    return await this.ditService.getDeploymentAssociatedDocument(deploymentDdpId);
  }

  private async getCenmDdpDocument(deploymentDocument: object) {
    const deploymentDdpId = await this.ditService.getCenmDeploymentDdpId(deploymentDocument);
    await this.sleep(1000);
    return await this.ditService.getDeploymentAssociatedDocument(deploymentDdpId);
  }

  private async retrieveDeploymentDescriptionInformation(environmentDataSourceData: Deployment[]): Promise<void> {
    for (const environment of environmentDataSourceData) {
      if (environment.platformType === 'physical') {
        this.dmtService.getDeploymentDescription(environment.name).subscribe((environmentDeploymentDescription) => {
          environment.deploymentDescription =
            environmentDeploymentDescription['deployment_description_data']['auto_deployment'];
        });
      }
    }
  }

  private listenForEvents(): void {
    this.ioConnection = this.socketService.onMessage()
      .subscribe((message: string) => {
        this.eventManager();
      });
  }

  private eventManager(): void {
    this.environmentSubject.next(this.environmentsPlatformToDisplay);
    this.allEnvironmentSubject.next(this.environmentsPlatformToDisplay);
  }
}
