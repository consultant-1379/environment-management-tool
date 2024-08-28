import 'zone.js';
import 'reflect-metadata';
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import 'zone.js/dist/zone';
import 'hammerjs';
import 'web-animations-js';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'sandbox') {
  environment['apiUrl'] = '/api';
  if (process.env.NODE_ENV === 'production') {
    environment.keycloak.url = `https://${window.location.hostname}/auth`;
  }
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
