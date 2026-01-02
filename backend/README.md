# VoyageConnect — Backend

Quick scaffold for the Spring Boot backend.

Prerequisites
- JDK 17
- Maven
- Docker & Docker Compose (for MySQL)

Run MySQL:

```bash
docker compose -f backend/docker-compose.yml up -d
```

Build & run the app:

```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```

Config: see `backend/src/main/resources/application.yml` for datasource and JWT placeholders.
