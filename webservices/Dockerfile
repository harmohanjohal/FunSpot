# Build stage
FROM maven:3.8.4-openjdk-11-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
COPY web ./web
RUN mvn clean package -DskipTests

# Run stage
FROM tomcat:9-jdk11-openjdk-slim
RUN rm -rf /usr/local/tomcat/webapps/*
COPY --from=build /app/target/WebServices.war /usr/local/tomcat/webapps/ROOT.war
COPY config.properties /usr/local/tomcat/
EXPOSE 8080
CMD ["catalina.sh", "run"]