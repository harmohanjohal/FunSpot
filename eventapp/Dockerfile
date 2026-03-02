# Build stage
FROM maven:3.8.4-openjdk-11-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
COPY web ./web
RUN mvn clean package -DskipTests

# Run stage
FROM tomcat:9-jre11-slim
RUN rm -rf /usr/local/tomcat/webapps/*
RUN mkdir -p /app/data
COPY --from=build /app/target/EventApp.war /usr/local/tomcat/webapps/ROOT.war
ENV JSON_FILE_PATH=/app/data/Events.json

EXPOSE 8080
CMD ["catalina.sh", "run"]