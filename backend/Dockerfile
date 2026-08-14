# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Cache dependencies first for faster builds
COPY pom.xml .
RUN mvn dependency:go-offline
# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Note for Spring Boot 3.x: If your build generates a "-plain.jar" alongside your main jar, 
# change "*.jar" below to your exact jar name (e.g., "ecolift-0.0.1-SNAPSHOT.jar") to avoid errors.
COPY --from=build /app/target/*.jar app.jar
# Render uses the PORT environment variable
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
