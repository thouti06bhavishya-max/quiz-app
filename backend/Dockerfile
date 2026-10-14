FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy entire build context (works whether context is root or backend)
COPY . .

# Detect if we are in repo root or backend folder, then build JAR
RUN if [ -d "backend" ]; then \
      cd backend && mvn clean package -DskipTests -B && cp target/*.jar /app/app.jar; \
    else \
      mvn clean package -DskipTests -B && cp target/*.jar /app/app.jar; \
    fi

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /app/app.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
