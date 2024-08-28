FROM armdocker.rnd.ericsson.se/dockerhub-ericsson-remote/jboss/keycloak:4.8.3.Final

# Copy custom themes from source control to keycloak container
COPY /themes/base/ keycloak/themes/base/
COPY /themes/keycloak/ keycloak/themes/keycloak/

# Copy metrics listener to keycloak container
COPY keycloak-metrics-spi-1.0.1-SNAPSHOT.jar keycloak/standalone/deployments

# Copy server file to keycloak container and give execute permissions with linux line endings
COPY standalone.sh /opt/jboss/keycloak/bin/
USER root
RUN sed -i.bak 's/\r$//' /opt/jboss/keycloak/bin/standalone.sh
RUN /bin/sh -c 'chmod +x /opt/jboss/keycloak/bin/standalone.sh'
USER jboss

# Copy server config to the container 
COPY keycloak-server-config.json /opt/jboss

# Set proxy forwarding to true for nginx
ENV PROXY_ADDRESS_FORWARDING=true

# Set flag such that ssl will only be required on staging and production
ENV development_or_production=DEVELOPMENT
