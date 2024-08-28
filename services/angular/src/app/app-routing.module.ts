import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeploymentComponent } from './deployments/deployment.component';
import { QuarantineManagementComponent } from
  './quarantine-management/quarantine-management.component';
import { ArmoryComponent } from
  './armory/armory.component';
import { WhatsNewComponent } from './whats-new/whats-new.component';
import { AdminEnvironmentComponent } from './admin-environments/admin-environment.component';
import { AdminRolesComponent } from './admin-roles/admin-roles.component';
import { AppAuthGuard } from './auth-guard';
import { HelpDocsEnvironmentsComponent }
  from './help-docs/environments/help-docs-environments.component';
import { HelpDocsLandingPageComponent } from './help-docs/help-docs-landing-page.component';
import { HelpDocsQuarantineManagementComponent }
from './help-docs/quarantine-management/help-docs-quarantine-management.component';
import { HelpDocsPermissionsComponent }
from './help-docs/permissions/help-docs-permissions.component';
import { HelpDocsAdministrationComponent }
from './help-docs/administration/help-docs-administration.component';

const routes: Routes = [
  { path: 'environments', component: DeploymentComponent },
  { path: 'sessions', component: QuarantineManagementComponent },
  { path: 'armory', component: ArmoryComponent },
  { path: 'whats-new', component: WhatsNewComponent },
  { path: 'help-docs', component: HelpDocsLandingPageComponent },
  { path: 'help-docs/environments', component: HelpDocsEnvironmentsComponent },
  { path: 'help-docs/permissions', component: HelpDocsPermissionsComponent },
  { path: 'help-docs/administration', component: HelpDocsAdministrationComponent },
  { path: 'help-docs/quarantine-management', component: HelpDocsQuarantineManagementComponent },
  { path: 'admin/environments', component: AdminEnvironmentComponent, canActivate: [AppAuthGuard] },
  { path: 'admin/user-roles', component: AdminRolesComponent, canActivate: [AppAuthGuard] },
  { path: '', component: DeploymentComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
        onSameUrlNavigation: 'reload',
      },
    ),
  ],
  exports: [RouterModule],
  providers: [AppAuthGuard],
})

export class AppRoutingModule { }
