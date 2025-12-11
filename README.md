### **Project Title and Description:**

Homework Manager is a microservices-based system designed to help students organize their homework assignments and deadlines. Students can add upcoming assignments and due dates. On the due date, they receive a notification reminding them that an assignment is due.

### **Architecture Overview:**

This system consists of three FastAPI microservices and an NGINX service orchestrated with Docker Compose:

1. user-service

- Manages user accounts
- Stores user information in its own Postgres database
- Independent (no downstream dependencies)

2. hw-service

- Stores user's homework entries in its own Postgres database
- Validates user existence by calling: GET http://user-service:8000/users/{id}
- After creating homework, schedules reminders by calling: POST http://notification-service:8000/notifications
- Aggregates health of user-service and notification-service
- hw-service is horizontally scaled (two replicas: hw-service-1 & hw-service-2). NGINX load balances /homework/\* across both

3. notification-service

- Receives notification requests from hw-service
- Stores them in its own Postgres DB
- Simulates sending notifications
- Independent service

If user-service or notification-service goes down, hw-service reports itself as unhealthy through its /health endpoint.

4. API GATEWAY (NGINX)

   Routes all client traffic:

   - http://localhost:8080/users/\* ==> user-service
   - http://localhost:8080/homework/\* ==> hw-service
   - http://localhost:8080/notifications/\* ==> notification-service
   - All services are accessed through a single gateway: http://localhost:8080

### **Prerequisites:**

Required software includes:

- Docker
- Docker Compose
- Python 3.11+

### **Installation & Setup:**

1. Clone the repository
   ```bash
   git clone https://github.com/joshua041904/Homework-Management-microservice.git
   ```
2. Build and start all services
   ```bash
   docker-compose up --build
   ```
   This will:
   - Build & launch all 3 microservices
   - Start 3 Postgres instances
   - Start NGINX API gateway (port 8080)
   - Start PGAdmin (port 5050)

### **Usage Instructions:**

- **Health Checks (through API Gateway)**
  curl http://localhost:8080/users/health/
  curl http://localhost:8080/homework/health/
  curl http://localhost:8080/notifications/health/
  Each will return a JSON health response with service name, status, and dependencies (if any).

Example Responses
user-service
{
"service": "user-service",
"status": "healthy",
"dependencies": {}
}

hw-service
{
"service": "hw-service",
"status": "healthy",
"dependencies": {
"user-service": { "status": "healthy", "response_time_ms": 12 },
"notification-service": { "status": "healthy", "response_time_ms": 10 }
}
}

notification-service
{
"service": "notification-service",
"status": "healthy",
"dependencies": {}
}

- **API Testing**

1. Create a User
   curl -X POST http://localhost:8080/users/ \
    -H "Content-Type: application/json" \
    -d '{"name": "Alice", "email": "alice@test.com", "grade_level": "11"}'

2. Create a Homework Entry
   curl -X POST http://localhost:8080/homework/ \
    -H "Content-Type: application/json" \
    -d '{"user_id": 1, "assignment_name": "Math Worksheet", "course": "Math", "due_date": "2025-02-15T12:00:00"}'

This will automatically trigger:

- user validation: hw-service → user-service
- notification creation: hw-service → notification-service

3. Check Dependencies
   Stop a service:

- docker compose stop notification-service
  Check hw-service health:
- curl http://localhost:8080/homework/health
  You will see "status": "unhealthy" for notification-service and a 503 status code.

- **How to Stop the System**
  docker-compose down

- **Rebuild Cleanly**
  docker-compose down --volumes
  - Warning: docker-compose down --volumes will delete all Postgres data and start with empty databases next time.
    docker-compose up --build

### **Project Structure:**

HomeworkManager/
├── README.md
├── CODE_PROVENANCE.md
├── architecture-diagram.png
├── docker-compose.yml
├── system-architecture-doc.md
├── docs/
│ └── health-sequence.md
├── user-service/
│ ├── Dockerfile
│ ├── requirements.txt
│ ├── main.py
│ ├── models.py
│ └── db.py
├── notification-service/
│ ├── Dockerfile
│ ├── requirements.txt
│ ├── main.py
│ ├── models.py
│ └── db.py
└── hw-service/
├── Dockerfile
├── requirements.txt
├── main.py
├── models.py
└── db.py
