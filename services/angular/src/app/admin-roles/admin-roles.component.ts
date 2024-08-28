import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import 'rxjs/add/operator/map';
import { EventsService } from './../services/event.service';
import { UpdateRolesComponent } from './update-roles.component';
import { KeycloakUsersService } from '../services/keycloak-users.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'admin-roles',
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.css'],
})

export class AdminRolesComponent implements OnInit {

  private username: string = '';
  private allKeycloakRoles;
  private isLoaderEnabled = false;
  private editRoleForm: FormGroup;
  private signumControl: AbstractControl;

  constructor(
    private eventsService: EventsService,
    private userService: KeycloakUsersService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.eventsService.sendMessage('hideTestPhases');
    this.userService.retrieveAllRoles().subscribe((allKeycloakRoles) => {
      this.allKeycloakRoles = allKeycloakRoles;
    });
    this.constructFormControl();
  }

  openErrorSnackBar(message: string): void {
    this.snackBar.open(message, '', {
      duration: 7000,
      panelClass: 'error-snackbar-class',
    });
  }

  private constructFormControl(): void {
    this.editRoleForm = this.formBuilder.group(
      {
        signumControl: ['', Validators.pattern('^[a-zA-Z]+$')],
      },
    );
    this.signumControl = this.editRoleForm.get('signumControl');
  }

  private async retrieveUser() {
    if (!this.signumControl.errors) {
      if (this.username.trim().length !== 7) {
        this.openErrorSnackBar(`Signum ${this.username} must be 7 characters long!`);
      } else {
        this.isLoaderEnabled = true;
        const rolesAssociatedWithUser =
          await this.userService.retrieveRolesAssociatedWithUser(this.username);
        if (rolesAssociatedWithUser) {
          if (rolesAssociatedWithUser[0] === 'No user found') {
            this.openErrorSnackBar(`User ${this.username} not found in EMT!`);
          } else {
            this.dialog.open(UpdateRolesComponent, {
              width: '550px',
              data: {
                username: this.username,
                userInformation: rolesAssociatedWithUser,
                allRoles: this.allKeycloakRoles,
              },
            });
            this.username = '';
          }
        }
        this.isLoaderEnabled = false;
      }
    }
  }
}
