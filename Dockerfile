# Root Dockerfile for Render / Cloud deployment
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy backend pom and source code
COPY backend/pom.xml .
COPY backend/src ./src

# Build production JAR without tests
RUN mvn clean package -DskipTests -B

# Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
