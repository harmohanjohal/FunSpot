FROM tomcat:9-jdk11-openjdk-slim

RUN rm -rf /usr/local/tomcat/webapps/*

COPY dist/ImageService.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080

CMD ["catalina.sh", "run"]