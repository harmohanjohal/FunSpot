FROM tomcat:9-jdk11-openjdk-slim

# Remove default Tomcat applications
RUN rm -rf /usr/local/tomcat/webapps/*

# Create directory for JSON data
RUN mkdir -p /app/data

# Copy your WAR file as ROOT.war
COPY dist/EventApp.war /usr/local/tomcat/webapps/ROOT.war

# Copy JSON data file
COPY Events.json /app/data/

# Set environment variable for JSON file path
ENV JSON_FILE_PATH=/app/data/Events.json

# Expose the port Tomcat runs on
EXPOSE 8080

# Run Tomcat
CMD ["catalina.sh", "run"]