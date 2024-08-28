import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class RoutingSessionService {
  constructor(
    private router: Router,
  ) { }

  enablePageRefresh(): any {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    const subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.router.navigated = false;
      }
    });
    return subscription;
  }
}
