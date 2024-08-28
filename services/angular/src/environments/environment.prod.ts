export const environment = {
  production: true,
  apiUrl: '/api',
  kibanaHost: 'http://atvts2665.athtem.eei.ericsson.se:5601',
  keycloak: {
    url: `https://${window.location.hostname}/auth`,
    realm: 'master',
    clientId: 'emt',
    credentials: {
      secret: '059b1ae0-fb4e-4149-a91e-8c302f2a9ea3',
    },
  },
};
