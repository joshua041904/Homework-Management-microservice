- **Project Title and Description:**
  Homework Manager is a microservices-based system designed to help students organize their homework assignments and deadlines. Students can add upcoming assignments and due dates. On the due date, they receive a notification reminding them that an assignment is due.

- **Architecture Overview:**
  This system consists of three FastAPI microservices orchestrated with Docker Compose:
  1. The user-service handles all user-related operations, such as account creation, deletion, and updates. This service is independent of the other services.
  2. The hw-service stores/manages homework assignments for each user. The hw-service depends on both the user-service and notification-service. It calls GET http://user-service:8000/users/{id} to verify the student exists before adding homework. It also calls POST http://notification-service:8000/schedule so that notification-service has the necessary information to send due-date reminders.
  3. The notification-service receives notification requests from hw-service, stores these requests, and simulates sending notifications to users. This service is independent of the other services.
     If user-service or notification-service goes down, hw-service reports itself as unhealthy through its /health endpoint.
- **Prerequisites:**
  The required software for this service includes Docker, Docker Compose, Python 3.11+.
- **Installation & Setup:**

  1. Clone the repository: git clone https://github.com/joshua041904/Homework-Management-microservice.git
  2. Build and start all services: docker-compose up --build
     This will:
     Build Docker images for all three services
     Start containers with network communication enabled
     Expose ports:
     user-service: 8001
     hw-service: 8002
     notification-service: 8003

- **Usage Instructions:**
  How to check health of your services (example curl commands or API endpoints)
  You can access health endpoints using curl commands once all containers are running.
  Check user-service: curl http://localhost:8001/health
  Check notification-service: curl http://localhost:8003/health
  Check hw-service (aggregates dependency health): curl http://localhost:8002/health
  Each will return a JSON health response with service name, status, and dependencies (if any).

- **API Documentation:**
  List of all health endpoints with request/response examples:

  1. user-service
     endpoint: /health
     example request: curl http://localhost:8001/health
     example response:
     {
     "service": "user-service",
     "status": "healthy",
     "dependencies": {}
     }

  2. hw-service
     endpoint: /health
     example request: curl http://localhost:8002/health
     example response:
     {
     "service": "hw-service",
     "status": "healthy",
     "dependencies": {
     "user-service": {
     "status": "healthy",
     "response_time_ms": 12
     },
     "notification-service": {
     "status": "healthy",
     "response_time_ms": 10
     }
     }
     }

  3. notification-service
     endpoint: /health
     example request: curl http://localhost:8003/health
     example response:
     {
     "service": "notification-service",
     "status": "healthy",
     "dependencies": {}
     }

- **Testing:**
  How to test the system (manual testing steps or test commands)

  1. Run the system with: docker-compose up
  2. Open the browser at:
     http://localhost:8001/health
     http://localhost:8002/health
     http://localhost:8003/health
  3. Stop one service (e.g., notification-service) and recheck hw-service:
     docker compose stop notification-service
     curl http://localhost:8002/health
     You should see "status": "unhealthy" for notification-service and a 503 status code.

- **Project Structure:**
  HomeworkManager/
  ├── README.md
  ├── CODE_PROVENANCE.md  
  ├── architecture-diagram.png  
  ├── docker-compose.yml
  ├── .gitignore  
  ├── docs/
  │ ├── architecture.md  
  │ └── health-sequence.mmd  
  ├── user-service/
  │ ├── Dockerfile
  │ ├── requirements.txt
  │ ├── .dockerignore
  │ ├── main.py
  │ └── models.py
  ├── notification-service/
  │ ├── Dockerfile
  │ ├── requirements.txt
  │ ├── .dockerignore
  │ ├── main.py
  │ └── models.py
  └── hw-service/
  ├── Dockerfile
  ├── requirements.txt
  ├── .dockerignore
  ├── main.py
  └── models.py
