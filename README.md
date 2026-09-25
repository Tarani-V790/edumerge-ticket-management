# EduMerge — Student Support & Ticket Management System

A full-stack student support and ticket management system built for the Edumerge Solutions Product Engineering Assignment. The system allows students to raise support requests and enables staff to manage, assign, prioritize, track, and resolve tickets with SLA visibility.

**Live Demo:** https://edumerge-ticket-management.vercel.app/
**API Health Check:** https://edumerge-ticket-management.onrender.com/api/health
**Repository:** https://github.com/Tarani-V790/edumerge-ticket-management

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [SLA Policy](#sla-policy)
- [Authentication & Authorization](#authentication--authorization)
- [API Reference](#api-reference)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Testing & Validation](#testing--validation)
- [Edge Cases Handled](#edge-cases-handled)
- [Assumptions & Trade-offs](#assumptions--trade-offs)
- [AI Usage](#ai-usage)

---

## Features

### Student
- Registration and login
- Create support tickets with category and priority
- View submitted tickets and ticket details
- Add comments on tickets
- View ticket status and SLA due time
- Reopen resolved or closed tickets

### Staff
- Login and role-based dashboard access
- View ticket statistics and support operations overview
- View, filter (by status/priority), and search all tickets
- Assign tickets to staff members
- Update ticket status
- Track SLA compliance and overdue tickets

### Ticket Management
- Auto-generated ticket numbers
- Categories: fees, attendance, documents, certificates
- Priority levels: `Low`, `Medium`, `High`, `Urgent`
- Lifecycle: `New → Assigned → In Progress → Pending → Resolved → Closed`
- Threaded comments per ticket
- Assignment and status history tracking
- SLA due-time calculation and overdue flagging

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React, Vite, React Router, Axios, CSS |
| Backend    | Node.js, Express.js, JWT, bcryptjs |
| Database   | PostgreSQL |
| Frontend Hosting | Vercel |
| Backend Hosting  | Render |
| Database Hosting | PostgreSQL on Render |

---

## Architecture

```
React + Vite Frontend
        |
        | REST API (Axios)
        ↓
Node.js + Express Backend
        |
        | SQL (pg driver)
        ↓
PostgreSQL Database
```

The frontend communicates with the backend exclusively through REST APIs. The backend owns all authentication, authorization, business logic, ticket operations, and database access — the frontend never accesses PostgreSQL directly.

---

## Database Design

| Table | Purpose |
|-------|---------|
| `users` | Student, staff, and manager accounts |
| `tickets` | Ticket number, title, description, category, priority, status, student, assigned staff, SLA due time, timestamps |
| `ticket_comments` | Comment thread associated with each ticket |
| `ticket_activity` | Activity/history log for operational tracking |

---

## SLA Policy

Prototype SLA durations used to demonstrate SLA tracking and overdue-ticket visibility (not official Edumerge values):

| Priority | SLA Window |
|----------|-----------|
| Low      | 48 hours |
| Medium   | 24 hours |
| High     | 8 hours |
| Urgent   | 2 hours |

---

## Authentication & Authorization

- JWT-based stateless authentication
- Passwords hashed with `bcryptjs`
- Role-based access control for **Student**, **Staff**, and **Manager**
- All protected routes require a valid JWT in the `Authorization` header

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`  | `/api/tickets` | Create a new ticket |
| `GET`   | `/api/tickets` | List tickets (supports status/priority filters) |
| `GET`   | `/api/tickets/:id` | Get ticket details |
| `PATCH` | `/api/tickets/:id/assign` | Assign ticket to staff |
| `PATCH` | `/api/tickets/:id/status` | Update ticket status |
| `PATCH` | `/api/tickets/:id/reopen` | Reopen a resolved/closed ticket |
| `POST`  | `/api/tickets/:id/comments` | Add a comment |
| `GET`   | `/api/tickets/:id/comments` | List comments |
| `GET`   | `/api/tickets/:id/activity` | Get ticket activity history |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tickets/dashboard/summary` | Aggregate ticket statistics |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server and database health check |

---

## Local Setup

### Prerequisites
- Node.js (LTS)
- PostgreSQL instance (local or hosted)

### Backend
```bash
cd backend
npm install
npm start
```
Runs on `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`

---

## Environment Variables

**Backend** — create `backend/.env`:
```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

`.env` files are excluded from version control via `.gitignore`.

---

## Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | https://edumerge-ticket-management.vercel.app/ |
| Backend  | Render  | https://edumerge-ticket-management.onrender.com/ |
| Health Check | — | https://edumerge-ticket-management.onrender.com/api/health |

---

## Testing & Validation

The backend was validated via the `/api/health` endpoint, confirming a live connection to PostgreSQL:

```json
{
  "status": "OK",
  "message": "Server and PostgreSQL are connected"
}
```

Manually tested during development: ticket creation, SLA calculation, authentication, ticket assignment, status transitions, and dashboard aggregation.

---

## Edge Cases Handled

- Missing or invalid/expired authentication token
- Invalid user role
- Duplicate email on registration
- Missing required ticket fields
- Invalid ticket status/priority values
- Unassigned tickets
- Empty ticket result sets
- Overdue ticket detection
- Reopening resolved/closed tickets
- API and database failure handling
- Frontend loading and error states

---

## Assumptions & Trade-offs

- SLA durations are prototype assumptions, not official policy.
- PostgreSQL is used as the sole persistent data store.
- JWT provides stateless authentication (no server-side session store).
- The prototype prioritizes the core ticket-management workflow over advanced notification integrations.
- The architecture is designed to accommodate additional categories, SLA rules, notification channels, and escalation logic in future iterations.

---

## AI Usage
Mandatory AI Usage Report

AI TOOL USED:
ChatGPT

WHAT I ASKED AI TO DO:

Understand the assignment requirements and plan the architecture and features for the Student Support & Ticket Management System.
Provide implementation guidance and help with React frontend, Node.js/Express backend, PostgreSQL, authentication, ticket management, SLA tracking, and deployment.
Help debug errors, review the implementation, identify edge cases, and prepare documentation such as the README and AI Usage Report.

PROMPT THAT WAS MOST USEFUL:
“Help me build the Student Support & Ticket Management system according to the assignment requirements. Explain the architecture, backend APIs, database design, frontend implementation, authentication, SLA tracking, and deployment step by step.”

CODE GENERATED BY AI: What part?
AI-generated implementation suggestions and code snippets for parts of the Express API routes, authentication/JWT middleware, PostgreSQL queries, React components, Axios API configuration, SLA calculation, and deployment configuration.

CODE I MODIFIED: What part?
I modified and integrated the generated code into my project structure, adjusted API routes and database queries, configured environment variables, updated frontend API communication, fixed routing/deployment configuration, and adapted the UI and functionality to match the assignment requirements.

AI OUTPUT THAT WAS WRONG:
The SLA due time was calculated correctly in the backend, but the initial SQL INSERT query did not include the due_at column, so the calculated SLA value was not being stored in the database.

HOW I IDENTIFIED THE PROBLEM:
I tested ticket creation and checked the stored ticket data in PostgreSQL. I noticed that the calculated SLA/due time was not being persisted. I traced the issue to the SQL INSERT statement, added the missing due_at column and parameter, and retested the ticket creation and SLA functionality.
