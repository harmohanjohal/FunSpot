FROM tomcat:9-jdk11-openjdk-slim

RUN rm -rf /usr/local/tomcat/webapps/*

COPY dist/WebServices.war /usr/local/tomcat/webapps/ROOT.war

COPY config.properties /usr/local/tomcat/

EXPOSE 8080

CMD ["catalina.sh", "run"]