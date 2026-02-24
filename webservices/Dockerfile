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
COPY --from=build /app/target/WebServices.war /usr/local/tomcat/webapps/ROOT.war

HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:8080/api/weather || exit 1

EXPOSE 8080
CMD ["catalina.sh", "run"]