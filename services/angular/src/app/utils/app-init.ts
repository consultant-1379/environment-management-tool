import { KeycloakService } from 'keycloak-angular';

import { environment } from '../../environments/environment';

export let keyCloakUser: KeycloakService;

export function initializer(keycloak: KeycloakService): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        await keycloak.init({
          config: environment.keycloak,
          initOptions: {
            onLoad: 'login-required',
            checkLoginIframe: false,
          },
          enableBearerInterceptor: true,
          bearerExcludedUrls: ['https://atvdit.athtem.eei.ericsson.se/*',
            'https://atvdtt.athtem.eei.ericsson.se/*',
            'https://jira-api.seli.wh.rnd.internal.ericsson.com/*'],
        });
        keyCloakUser = keycloak;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
}
