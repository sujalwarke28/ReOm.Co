# API Architecture

## Overview
The RESTful API is built on Node.js/Express.js using TypeScript. All requests will use JSON payloads. Responses will follow a standardized format.

## Global Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "error": null
}
```

## Security & Middleware
- **Authentication**: JWT token in the `Authorization: Bearer <token>` header.
- **RBAC Middleware**: Validates if the authenticated user has the required role (Admin, Manager, Operational Staff, Executive) to access the endpoint.
- **Validation**: Zod schema validation on all incoming request bodies and parameters.

## Core Resource Endpoints

### Auth (`/api/auth`)
- `POST /login` - Authenticate user & issue JWT
- `POST /logout` - Invalidate session

### Users (`/api/users`)
- `GET /` - List users (Admin/Manager)
- `POST /` - Create a new user (Admin)
- `GET /:id` - Get user details

### Tasks (`/api/tasks`)
- `GET /` - List tasks
- `POST /` - Create a task
- `PUT /:id` - Update task (Status, Edit)
- `DELETE /:id` - Delete task (Admin)

### Approvals (`/api/approvals`)
- `GET /` - List approval requests
- `POST /` - Submit a request
- `PUT /:id/approve` - Approve request (Manager/Admin)
- `PUT /:id/reject` - Reject request (Manager/Admin)

### Reports (`/api/reports`)
- `GET /` - Get generated reports summary
- `GET /analytics` - Get specific analytical data sets

### Monitoring & Alerts (`/api/monitoring`)
- `GET /metrics` - Get system metrics (CPU, Mem)
- `GET /alerts` - Get active alerts
