import { TestBed, async, ComponentFixture, inject } from '@angular/core/testing';

import { ManageButtonComponent } from './manage-button.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularMaterialModule } from '../../app.module';
import { Router } from '@angular/router';
import { SessionService } from '../../quarantine-management/session.service';
import { RoutingSessionService } from '../../services/routing.service';
import { TeamInventoryService } from '../../services/team-inventory.service';
import { DeploymentSessionService } from '../../services/deployment-session.service';
import { TimersService } from 'app/quarantine-management/timers.service';
import { Logger } from './../../services/logging.service';
import { AnsibleService } from '../../services/ansible.service';

describe('ManageButtonComponent', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgMultiSelectDropDownModule,
        ReactiveFormsModule, AngularMaterialModule],
      declarations: [ManageButtonComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: SessionService, useValue: {} },
        { provide: TeamInventoryService, useValue: {} },
        { provide: DeploymentSessionService, useValue: {} },
        { provide: RoutingSessionService, useValue: {} },
        { provide: TimersService, useValue: {} },
        { provide: Logger, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: AnsibleService, useValue: {} },
      ],
    }).compileComponents();
    this.fixture = TestBed.createComponent(ManageButtonComponent);
  });

  it('should be created', () => {
    expect(this.fixture).toBeTruthy();
  });
});
