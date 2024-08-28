FROM armdocker.rnd.ericsson.se/dockerhub-ericsson-remote/logstash:7.1.1

RUN rm -f -v /usr/share/logstash/pipeline/logstash.conf
COPY pipeline/ /usr/share/logstash/pipeline/

