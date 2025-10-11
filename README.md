# Workforce Management System - Backend Engineering Assessment
- A scalable, production-ready Node.js backend system designed to handle workforce management for companies scaling from 100 to 10,000+ employees. This solution addresses high traffic, queue backlogs, maintainability, and clear separation of responsibilities through clean architecture and scalable design patterns.

## Note on Docker
### Docker integration is partially implemented.
    - docker logs workforce_app currently returns an error related to build output.
    - Successful Postman requests are not yet persisting data to the MySQL container.
  - The application, however, runs correctly in local (non-Docker) environments.

## Assessment Implementation Overview
### Fully Implemented Requirements
1. Database & Schema Design (MySQL)
 - Optimized Schema with proper indexing for large datasets
 - Foreign Key Constraints for referential integrity
 - Strategic Indexing on frequently queried fields (employeeId, departmentId)
 - UUID Primary Keys for distributed systems compatibility
 - Enum Constraints for status management

2. API Endpoints (Express.js)
 - RESTful APIs with consistent response wrapper pattern
 - Repository Pattern for database interactions
 - Service Layer Pattern for business logic separation
 - Thin Controllers focusing only on request/response handling
 - Pagination Support for scalable data retrieval

3. Message Queue Processing (RabbitMQ)
 - Producer Implementation for leave.requested messages
 - Consumer/Worker with business rules:
 - Auto-approve leaves ≤ 2 days
 - Mark longer leaves as PENDING_APPROVAL
 - Retry Mechanism with exponential backoff strategy
 - Idempotency handling to prevent duplicate processing
 - Dead Letter Queue for failed message handling

4. Scalability Considerations
 - Database: Pagination, comprehensive indexing, connection pooling
 - Queue: Multiple consumers, DLQ, message persistence
 - API: Rate limiting, request validation, proper error handling

5. Testing
 - Unit Tests: Business rules (leave auto-approval logic)
 - Integration Tests: API endpoints with Supertest
 - Queue Tests: Message processing with mocked RabbitMQ

## Architecture & Design Patterns
Clean Architecture Implementation
```bash
Controller Layer (HTTP handling)
    ↓
Service Layer (Business logic)
    ↓
Repository Layer (Data access)
    ↓
Model Layer (Data structure)
```

## Design Patterns Applied
 - Repository Pattern - Abstracted data access layer
 - Service Layer Pattern - Business logic separation
 - Strategy Pattern - Retry policies for queue processing
 - Factory Pattern - Database connection management
 - Wrapper Pattern - Consistent API responses


## Prerequisites
 - Node.js 18+
 - MySQL 8.0+
 - RabbitMQ 3.12+

# Local Development
### Clone & Setup
```bash
git clone git@github.com:Chinweike99/akwolu_innocent_chinweike.git
cd akwolu_innocent_chinweike
npm install
npm run dev
```

##  Database Setup
```bash
-- Create database
CREATE DATABASE workforce_management;
```

# Docker Development
```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec app npm run migrate
```


## Implemented Endpoints
1. Create Department
```bash
POST /departments
Content-Type: application/json

{
  "name": "Engineering"
}
```

2. List Department Employees (Paginated)
```bash
GET /departments/:id/employees?page=1&limit=10
```

3. Create Employee
```bash
POST /employees
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "departmentId": "dept-123"
}
```

4. Get Employee with Leave History
```bash
GET /employees/:id
```

5. Create Leave Request
```bash
POST /leave-requests
Content-Type: application/json

{
  "employeeId": "emp-123",
  "startDate": "2024-02-01",
  "endDate": "2024-02-03",
  "idempotencyKey": "unique-request-123"
}
```


## Running the Assessment
1. Start Services
```bash
# Option A: Local development
npm run dev

# Option B: Docker
docker-compose up -d
docker-compose exec app npm run migrate
```

2. Run Tests
```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Specific test suites
npm run test:unit
npm run test:integration
```

