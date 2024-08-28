import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollToModule } from 'ng2-scroll-to-el';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule, DefaultValueAccessor } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { AppComponent } from './app.component';
import { ChartModule } from 'angular-highcharts';

import { DeploymentComponent } from './deployments/deployment.component';
import { DeploymentChartComponent } from './deployments/charts/deployment-charts.component';
import { QuarantineManagementComponent }
  from './quarantine-management/quarantine-management.component';
import { ArmoryComponent }
  from './armory/armory.component';
import { SessionComponent } from './quarantine-management/sessions/session.component';
import { BrowserCheckerComponent, SnackbarErrorComponent } from
  './browserChecker/browserChecker.component';

import { ChartConverter } from './charts/chart-converter';
import { ChartBuilder } from './charts/chart-builder';
import { NameButtonComponent } from './deployments/dit/deployment-name-button.component';
import { DeploymentInformationModal }
  from './deployments/deployment-info/deployment-information-modal.component';
import { DeploymentInformation }
  from './deployments/deployment-info/deployment-information.component';
import { ProductSetButton } from './deployments/cifwk/product-set.component';
import { CreateSessionButtonComponent }
  from './deployments/session/create-session.component';
import { CreateButtonComponent }
  from './deployments/session/create-button.component';
import { ManageSessionButtonComponent }
  from './deployments/session/manage-session.component';
import { ManageButtonComponent }
  from './deployments/session/manage-button.component';
import { AdditionalDeploymentInfoComponent } from
  './deployments/deployment-info/additional-deployment-info/additional-deployment-info.component';
import { ConfirmAutoTriggerSHC } from
  './deployments/deployment-actions/confirm-autotriggershc.component';
import { DeploymentActionsComponent } from
  './deployments/deployment-actions/deployment-actions.component';
import { DeploymentOtherInfoComponent } from
  './deployments/deployment-other-info/deployment-other-info.component';
import { KeycloakUsersService } from './services/keycloak-users.service';
import { SessionService } from './quarantine-management/session.service';
import { TimePeriodService } from './quarantine-management/timeperiod.service';
import { TimersService } from './quarantine-management/timers.service';
import { DeploymentSessionService } from './services/deployment-session.service';
import { RoutingSessionService } from './services/routing.service';
import { AnsibleService } from './services/ansible.service';
import { JenkinsService } from './services/jenkins.service';
import { DeploymentService } from './services/deployments.service';
import { DitService } from './services/dit.service';
import { DttService } from './services/dtt.service';
import { DmtService } from './services/dmt.service';
import { Logger } from './services/logging.service';
import { ClipboardModule } from 'ngx-clipboard';
import { AppRoutingModule } from './app-routing.module';
import { TeamInventoryService } from './services/team-inventory.service';
import { WhatsNewComponent } from './whats-new/whats-new.component';
import { HelpDocsLandingPageComponent } from './help-docs/help-docs-landing-page.component';
import { HelpDocsQuarantineManagementComponent }
  from './help-docs/quarantine-management/help-docs-quarantine-management.component';
import { HelpDocsEnvironmentsComponent }
  from './help-docs/environments/help-docs-environments.component';
import { HelpDocsAdministrationComponent }
  from './help-docs/administration/help-docs-administration.component';
import { HelpDocsPermissionsComponent }
  from './help-docs/permissions/help-docs-permissions.component';
import { HelpDocsNavigationComponent } from './help-docs/navigation/help-docs-navigation.component';
import { WebsocketService } from './services/websocket-service';
import { EventsService } from './services/event.service';
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { initializer } from './utils/app-init';
import { SystemPanelComponent } from './systemPanel/system-panel.component';
import { AdminEnvironmentComponent } from './admin-environments/admin-environment.component';
import { ConfirmRemoveEnvironmentComponent }
  from './admin-environments/confirm-remove-environment.component';
import { ConfirmEditEnvironmentComponent }
  from './admin-environments/confirm-edit-environment.component';
import { EnvironmentAlertsComponent } from './admin-environments/environment-alerts.component';
import { AddEnvironmentComponent } from './admin-environments/add-environment.component';
import { AdminRolesComponent } from './admin-roles/admin-roles.component';
import { UpdateRolesComponent } from './admin-roles/update-roles.component';
import { EditEnvironmentComponent } from './admin-environments/edit-environment.component';
import { AdminEnvironmentService } from './services/admin-environment.service';
import { SessionCredentialModalComponent }
from './quarantine-management/sessions/session-credential-modal.component';
import { DynamicSessionCredentialInfoComponent }
from './quarantine-management/sessions/session-credential-info.component';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';

@NgModule({
  exports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
})
export class AngularMaterialModule { }

@NgModule({
  declarations: [
    AppComponent,
    AdditionalDeploymentInfoComponent,
    ArmoryComponent,
    DeploymentComponent,
    DeploymentChartComponent,
    NameButtonComponent,
    DeploymentInformationModal,
    DeploymentInformation,
    ProductSetButton,
    CreateSessionButtonComponent,
    CreateButtonComponent,
    ManageSessionButtonComponent,
    ManageButtonComponent,
    QuarantineManagementComponent,
    SessionComponent,
    SystemPanelComponent,
    WhatsNewComponent,
    HelpDocsLandingPageComponent,
    HelpDocsEnvironmentsComponent,
    HelpDocsPermissionsComponent,
    HelpDocsAdministrationComponent,
    HelpDocsQuarantineManagementComponent,
    HelpDocsNavigationComponent,
    DeploymentActionsComponent,
    DeploymentOtherInfoComponent,
    BrowserCheckerComponent,
    SnackbarErrorComponent,
    AdminEnvironmentComponent,
    EnvironmentAlertsComponent,
    ConfirmRemoveEnvironmentComponent,
    ConfirmEditEnvironmentComponent,
    ConfirmAutoTriggerSHC,
    AddEnvironmentComponent,
    AdminRolesComponent,
    UpdateRolesComponent,
    EditEnvironmentComponent,
    SessionCredentialModalComponent,
    DynamicSessionCredentialInfoComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ChartModule,
    HttpClientModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ScrollToModule.forRoot(),
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatSelectModule,
    ClipboardModule,
    KeycloakAngularModule,
  ],
  providers: [
    ChartConverter,
    DeploymentChartComponent,
    ChartBuilder,
    SessionService,
    DeploymentSessionService,
    RoutingSessionService,
    AnsibleService,
    JenkinsService,
    EditEnvironmentComponent,
    AddEnvironmentComponent,
    DeploymentService,
    AdminEnvironmentService,
    DitService,
    DttService,
    DmtService,
    TimePeriodService,
    TimersService,
    TeamInventoryService,
    WebsocketService,
    EventsService,
    KeycloakUsersService,
    Logger,
    {
      provide: APP_INITIALIZER,
      useFactory: initializer,
      multi: true,
      deps: [KeycloakService],
    },
  ],
  entryComponents: [
    CreateSessionButtonComponent,
    CreateButtonComponent,
    DeploymentInformationModal,
    DeploymentInformation,
    ManageSessionButtonComponent,
    ManageButtonComponent,
    DeploymentActionsComponent,
    SnackbarErrorComponent,
    AdminEnvironmentComponent,
    ConfirmRemoveEnvironmentComponent,
    ConfirmEditEnvironmentComponent,
    ConfirmAutoTriggerSHC,
    EnvironmentAlertsComponent,
    AddEnvironmentComponent,
    AdminRolesComponent,
    UpdateRolesComponent,
    EditEnvironmentComponent,
    SessionCredentialModalComponent,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
