import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { keyCloakUser } from './utils/app-init';

@Injectable()
export class AppAuthGuard implements CanActivate {

  constructor(
    private router: Router,
    ) {}

  canActivate(): boolean {
    if (keyCloakUser.isUserInRole('OPS')) {
      return true;
    }
    this.router.navigate(['/environments']);
    return false;
  }
}
