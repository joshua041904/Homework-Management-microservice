- **System Purpose:**
  The Homework Manager system helps students organize and manage their homework assignments and deadlines.
  Users can log in, add upcoming assignments, and receive automatic notifications on the day assignments are due.
  This system addresses a common academic problem: missed deadlines caused by poor organization or lack of reminders. By centralizing assignment tracking and sending timely alerts, Homework Manager improves organization and reduces stress for students.

- **Service Boundaries:**
  user-service
  Responsibility: Handles all user-related operations, including creating, updating, retrieving, and deleting user accounts.
  Dependencies: None. user-service is completely independent - it does not call or depend on any other service.
  Reason for Separation: Keeping user data isolated ensures clear boundaries and simplifies authentication.

  hw-service
  Responsibility: Manages all homework assignment data, including creation, deletion, and updates. Each assignment is linked to a user and contains a due date.
  Dependencies: hw-service depends on both user-service and notification-service. It depends on user-service because hw-service must verify that the user exists before creating a homework entry (a hw assignment must be associated to a user). It depends on notification-service because hw-service sends notification requests when an assignment is due (deadlines are associated with each hw assignment, so it is hw-service's responsibility for sharing this deadline info with the notification-service)
  Reason for Separation: Homework management has its own logic (linking users and scheduling reminders). Separating it allows it to evolve independently — for instance, to support group projects or grading features later.

  notification-service
  Responsibility: Sends out notifications to users, reminding them when assignments are due. Notifications are typically sent nine hours before the due date.
  Dependencies: None. This service does not depend on the other services; it simply receives instructions from hw-service on when and what to send (and to who).
  Reason for Separation: Notification systems often require unique infrastructure (e.g., email, SMS, or push gateways). Keeping it separate avoids coupling that would complicate scaling and maintenance.

- **Data Flow:**
  Health check data and dependency information flow downstream from hw-service to its dependent services:

1. A client (user or monitoring tool) calls GET /health on hw-service.
2. hw-service initiates two HTTP requests:

- One to user-service ==> GET /health
- One to notification-service ==> GET /health

3. Each dependency returns a JSON health response with its service name, status, and response time.
4. hw-service aggregates these results and returns a combined JSON object showing its own status and the health of both dependencies.

- If all dependencies are healthy ==> hw-service responds with HTTP 200 (healthy).
- If any dependency is unhealthy or unreachable ==> hw-service responds with HTTP 503 (unhealthy).
  This creates a downstream health propagation model, where each dependent service contributes to the overall system status.

- **Communication Patterns:**
  The system follows a request-response communication pattern using RESTful HTTP calls.

Inter-service communication:

- hw-service communicates with user-service and notification-service over internal Docker network URLs:
- http://user-service:8000/health
- http://notification-service:8000/health
  This allows hw-service to check the availability and performance of its dependencies asynchronously using httpx.AsyncClient.

Health check aggregation:

- The health flow is unidirectional (downstream).
- Only hw-service calls other services — the others never call back.
- Each microservice also exposes its own /health endpoint for independent checks.

Client communication:

- External clients (developers, users, or monitoring tools) can access any service’s /health endpoint via localhost:<port>/health after starting Docker Compose.

- **Technology Stack:** List of technologies used and justification for choices
  FastAPI:
  Used to build lightweight RESTful microservices. Chosen for its simplicity, speed, and built-in Pydantic model validation that supports JSON schema enforcement for health responses.

  Uvicorn:
  ASGI server to run FastAPI applications. Lightweight, fast, and easy to containerize.

  httpx:
  Used for asynchronous HTTP requests between microservices (for health aggregation in hw-service).

  Docker / Docker Compose:
  Used to containerize and orchestrate all three services (user-service, hw-service, notification-service) with isolated environments and service-to-service networking.

  Pydantic (v2):
  Used to define and validate structured health response models (HealthResponse, DependencyHealth, and HealthStatus).

  Mermaid.js:
  Diagraming tool used to visualize architecture and health check flows in architecture-diagram.png
