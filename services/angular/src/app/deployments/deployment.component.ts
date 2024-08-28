import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatSnackBar, MatTableDataSource, MatSort } from '@angular/material';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { keyCloakUser } from '../utils/app-init';
import 'rxjs/add/operator/map';

import { environment } from '../../environments/environment';
import { DeploymentService } from '../services/deployments.service';
import { Deployment } from '../models/deployment';
import { DeploymentChartComponent } from './charts/deployment-charts.component';
import { DeploymentSessionService } from '../services/deployment-session.service';
import { WebsocketService } from '../services/websocket-service';
import { EventsService } from '../services/event.service';
import { KeycloakUsersService } from './../services/keycloak-users.service';

@Component({
  templateUrl: './deployment.component.html',
  styleUrls: ['./deployment.component.css'],
})

export class DeploymentComponent implements OnInit {

  private API = environment.apiUrl;
  private sessions: any[] = [];
  ioConnection: any;
  private isUserEditing: boolean = false;
  wasEventSentWhileEditing: boolean;
  private listOfSupportedTestPhases: string[] = [
    'MTE', 'CDL', 'LongLoop', 'DROPBACK', 'PLM', 'RVB', 'STKPI', 'RNL', 'ENDURANCE', 'TEaaS', 'RTD',
    'SprintValidation', 'CS',
  ];
  private listOfSupportedPlatformTypes: string[] = [
    'physical', 'vENM', 'cENM', 'SIENM',
  ];
  private checkUserPermissions: boolean;

  @Input() isChartHidden = false;

  private deploymentsPlatformToDisplay = 'ALL';
  chartDeployments: Deployment[];
  private idleDeploymentsDataSource: MatTableDataSource<Deployment> = new MatTableDataSource();
  private busyDeploymentsDataSource: MatTableDataSource<Deployment> = new MatTableDataSource();
  private quarantinedDeploymentsDataSource:
  MatTableDataSource<Deployment> = new MatTableDataSource();

  private idleDeploymentsSubscription: Subscription;
  private busyDeploymentsSubscription: Subscription;
  private quarantineDeploymentsSubscription: Subscription;
  private chartDeploymentsSubscription: Subscription;

  private deploymentSubject = new Subject<string>();
  private allDeploymentSubject = new Subject<string>();

  displayColumns: string[] = [
    'name', 'testPhase', 'productSet', 'assignedJob',
    'deploymentType', 'otherInformation', 'actions',
    'deploymentActionsMenu',
  ];

  @ViewChild('idleTable') idleSort: MatSort;
  @ViewChild('busyTable') busySort: MatSort;
  @ViewChild('quarantineTable') quarantineSort: MatSort;

  constructor(
    private chart: DeploymentChartComponent,
    private deploymentService: DeploymentService,
    private deploymentSessionService: DeploymentSessionService,
    private snackBar: MatSnackBar,
    private socketService: WebsocketService,
    private eventsService: EventsService,
    private keycloakUsersService: KeycloakUsersService,
  ) { }

  ngOnInit() {
    const listOfTestPhases: string = this.getTestPhasesAssignedToUser();
    this.getDeploymentInfo(listOfTestPhases);
    this.retrieveInformationForDeploymentTypes('ALL');
    this.listenForEvents();
    this.listenForUserEditing();
    this.listenForUpdateToTestPhases();
    this.listenForUpdateToPlatformTypes();
    this.eventsService.sendMessage('showTestPhases');
    this.checkUserPermissions = this.keycloakUsersService.checkUserPermissions();
  }

  private retrieveInformationForDeploymentTypes(type: string): void {
    this.deploymentSubject.next(type);
    this.allDeploymentSubject.next(type);
  }

  isSystemHealthCheckRequired(deployment: Deployment) {
    if (deployment.systemHealthCheckStatus === 'REQUIRED') {
      return true;
    }
    return false;
  }

  applyFilter(filterValue: string) {
    const filter = filterValue.trim().toLowerCase();
    this.idleDeploymentsDataSource.filter = filter;
    this.busyDeploymentsDataSource.filter = filter;
    this.quarantinedDeploymentsDataSource.filter = filter;
  }

  changeState(type: string): void {
    this.deploymentsPlatformToDisplay = type;
    this.retrieveInformationForDeploymentTypes(type);
  }

  openShcSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: 'custom-snackbar-class',
    });
  }

  getDeploymentInfo(listOfTestPhases: string): void {
    this.retrieveAllDeploymentsForChart(listOfTestPhases);
    this.retrieveIdleDeployments(listOfTestPhases);
    this.retrieveBusyDeployments(listOfTestPhases);
    this.retrieveQuarantineDeployments(listOfTestPhases);
  }

  private getTestPhasesAssignedToUser(): string {
    const listOfRolesAssignedToUser: string[] = this.retrieveUserRoles();
    let listOfTestPhases: string = '';

    listOfRolesAssignedToUser.forEach((roleAssignedToUser) => {
      if (this.listOfSupportedTestPhases.indexOf(roleAssignedToUser) !== -1) {
        if (listOfTestPhases) listOfTestPhases += '%';
        listOfTestPhases = `${listOfTestPhases}${roleAssignedToUser}`;
      }
    });
    return listOfTestPhases;
  }

  private retrieveUserRoles(): string[] {
    if (keyCloakUser.isUserInRole('OPS')) {
      return keyCloakUser.getUserRoles();
    }
    return keyCloakUser.getUserRoles()
      .concat(this.listOfSupportedTestPhases);
  }

  private drawChart(deploymentsToDisplay: Deployment[]): void {
    this.chart.buildChart(deploymentsToDisplay);
  }

  private retrieveAllDeploymentsForChart(testPhases: string): void {
    const allDeployments = this.allDeploymentSubject.pipe(
      debounceTime(1500),
      switchMap(type =>
        this.deploymentService.getDeploymentsForChart(testPhases, type),
        ),
    );
    this.chartDeploymentsSubscription = allDeployments.subscribe((returnedDeployments) => {
      this.drawChart(returnedDeployments);
    });
  }

  private retrieveIdleDeployments(testPhases: string): void {
    const idleDeployments = this.deploymentSubject.pipe(
      debounceTime(500),
      switchMap(type =>
        this.deploymentService.deploymentsForTableType('IDLE', type, testPhases),
      ),
    );
    this.idleDeploymentsSubscription = idleDeployments.subscribe((returnedIdleDeployments) => {
      this.idleDeploymentsDataSource.data = returnedIdleDeployments;
      this.idleDeploymentsDataSource.sort = this.idleSort;
      this.editProductSetSortingAccessor(this.idleDeploymentsDataSource);
    });
  }

  private resetTables(testPhases: string): void {
    this.chartDeploymentsSubscription.unsubscribe();
    this.idleDeploymentsSubscription.unsubscribe();
    this.busyDeploymentsSubscription.unsubscribe();
    this.quarantineDeploymentsSubscription.unsubscribe();
    this.getDeploymentInfo(testPhases);
    this.eventManager();
  }

  private retrieveBusyDeployments(testPhases: string): void {
    const busyDeployments = this.deploymentSubject.pipe(
      debounceTime(500),
      switchMap(type =>
        this.deploymentService.deploymentsForTableType('BUSY', type, testPhases),
      ),
    );
    this.busyDeploymentsSubscription = busyDeployments.subscribe((busyDeployments) => {
      this.busyDeploymentsDataSource.data = busyDeployments;
      this.busyDeploymentsDataSource.sort = this.busySort;
      this.editProductSetSortingAccessor(this.busyDeploymentsDataSource);
    });
  }

  private retrieveQuarantineDeployments(testPhases: string): void {
    const quarantineDeployments = this.deploymentSubject.pipe(
      debounceTime(500),
      switchMap(type =>
        this.deploymentService.deploymentsForTableType('QUARANTINE', type, testPhases),
      ),
    );
    this.quarantineDeploymentsSubscription =
    quarantineDeployments.subscribe((returnedQuarantineDeployments) => {
      this.quarantinedDeploymentsDataSource.data = returnedQuarantineDeployments;
      this.quarantinedDeploymentsDataSource.sort = this.quarantineSort;
      this.editProductSetSortingAccessor(this.quarantinedDeploymentsDataSource);
    });
  }

  private editProductSetSortingAccessor(
    deploymentMatTableDataSource: MatTableDataSource<Deployment>): void {
    deploymentMatTableDataSource.sortingDataAccessor = (item, property) => {
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

  private listenForEvents(): void {
    this.ioConnection = this.socketService.onMessage()
      .subscribe((message: string) => {
        this.eventManager();
      });
  }

  private listenForUserEditing(): void {
    this.eventsService.getMessage().subscribe((message) => {
      if (message === 'editing') {
        this.isUserEditing = true;
      } else if (message === 'finished editing') {
        this.isUserEditing = false;
      }
    });
  }

  private listenForUpdateToTestPhases(): void {
    this.eventsService.getMessage().subscribe((message) => {
      if (message.includes('%') ||
      (this.listOfSupportedTestPhases.indexOf(message) !== -1) || (message === 'reset')) {
        this.resetTables(message);
      }
    });
  }

  private listenForUpdateToPlatformTypes(): void {
    this.eventsService.getMessage().subscribe((message) => {
      if (message === 'reset') {
        this.changeState('ALL');
        this.eventsService.sendMessage('selectphases');
      } else if (message.includes('&') ||
      (this.listOfSupportedPlatformTypes.indexOf(message) !== -1)) {
        if (message.includes('&')) {
          const re = /&/gi;
          this.changeState(message.replace(re, '%'));
        } else {
          this.changeState(message);
        }
      }
    });
  }

  private eventManager(): void {
    if (this.isUserEditing === false) {
      this.deploymentSubject.next(this.deploymentsPlatformToDisplay);
      this.allDeploymentSubject.next(this.deploymentsPlatformToDisplay);
    }
  }

}
