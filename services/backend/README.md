# Wedding Photo Planet CRM - Backend API

Production-ready, secure, and scalable backend for **Wedding Photo Planet CRM**. Built with Node.js, TypeScript, Express, Prisma ORM, MySQL, and Socket.IO.

---

## 🛠️ Technology Stack

- **Runtime & Language**: Node.js, TypeScript
- **Framework**: Express.js
- **ORM & Database**: Prisma ORM with MySQL
- **Real-Time Communication**: Socket.IO (WebSockets)
- **Security & Validation**: JWT, bcryptjs, HTTP-only cookies, Helmet, Zod, Rate Limiting (express-rate-limit)
- **Session & Inactivity Engine**: Background Inactivity Watcher (10m idle timeout + 5m countdown grace period with auto-logout and socket warnings)

---

## 📁 Directory Structure

```
services/backend/
├── prisma/
│   ├── schema.prisma         # Complete relational schema (23 models & 12 enums)
│   └── seed.ts               # Database seed script for initial admin, team & settings
├── src/
│   ├── config/
│   │   ├── env.ts            # Typed environment configuration
│   │   └── prisma.ts         # Singleton Prisma client
│   ├── controllers/          # Request handlers
│   │   ├── activity.controller.ts
│   │   ├── attendance.controller.ts
│   │   ├── audit.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── break.controller.ts
│   │   ├── crm.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── report.controller.ts
│   │   ├── session.controller.ts
│   │   ├── setting.controller.ts
│   │   ├── task.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/           # Security, Auth, RBAC & Validation
│   │   ├── audit.ts
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validate.ts
│   ├── routes/               # Modular route definitions
│   │   ├── activity.routes.ts
│   │   ├── attendance.routes.ts
│   │   ├── audit.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── break.routes.ts
│   │   ├── crm.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── report.routes.ts
│   │   ├── session.routes.ts
│   │   ├── setting.routes.ts
│   │   ├── task.routes.ts
│   │   ├── user.routes.ts
│   │   └── index.ts
│   ├── services/             # Business logic & Database queries
│   │   ├── activity.service.ts
│   │   ├── attendance.service.ts
│   │   ├── audit.service.ts
│   │   ├── auth.service.ts
│   │   ├── break.service.ts
│   │   ├── crm.service.ts
│   │   ├── inactivityMonitor.service.ts
│   │   ├── notification.service.ts
│   │   ├── report.service.ts
│   │   ├── session.service.ts
│   │   ├── setting.service.ts
│   │   ├── task.service.ts
│   │   ├── user.service.ts
│   │   └── workSession.service.ts
│   ├── sockets/
│   │   └── socketServer.ts   # WebSocket rooms, real-time broadcasts & live activity stream
│   ├── types/
│   │   └── index.ts          # Authenticated request, JWT and token interfaces
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── response.ts
│   │   └── userAgent.ts
│   └── server.ts             # Application entry point
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Installation
```bash
cd services/backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your MySQL database URL:
```bash
cp .env.example .env
```

### 3. Database Migration & Prisma Generation
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Database Seeding
Populate the database with default settings, initial Admin account, Manager, and sample members:
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

---

## 📡 API Endpoint Overview

### 🔐 Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Member & Admin login with JWT & device capture
- `POST /api/v1/auth/logout`: Session termination & attendance update
- `GET  /api/v1/auth/me`: Current logged-in member profile
- `POST /api/v1/auth/heartbeat`: Keep-alive ping and real-time activity update

### 👥 Team & Users (`/api/v1/users`)
- `GET    /api/v1/users`: List team members (Admin/Manager)
- `POST   /api/v1/users`: Create new member account (Admin)
- `GET    /api/v1/users/:id`: Member details (Self or Admin)
- `PATCH  /api/v1/users/:id`: Update member details
- `POST   /api/v1/users/:id/reset-password`: Admin password reset
- `DELETE /api/v1/users/:id`: Deactivate account

### 📋 Tasks & Work Sessions (`/api/v1/tasks`)
- `GET   /api/v1/tasks`: Filter tasks by status, assignee, priority, project
- `POST  /api/v1/tasks`: Create task
- `GET   /api/v1/tasks/:id`: Task details with work session history
- `PATCH /api/v1/tasks/:id`: Update task
- `POST  /api/v1/tasks/:id/reassign`: Reassign task with audit log
- `POST  /api/v1/tasks/:id/start`: Start work timer & live session
- `POST  /api/v1/tasks/:id/pause`: Pause work session
- `POST  /api/v1/tasks/:id/resume`: Resume work session
- `POST  /api/v1/tasks/:id/complete`: Mark task completed & calculate actual time

### 👁️ Live Monitoring & Activity (`/api/v1/activity`)
- `POST /api/v1/activity/heartbeat`: Activity ping
- `GET  /api/v1/activity/live`: Real-time active team status (Admin/Manager)
- `GET  /api/v1/activity/member/:id`: Member activity timeline
- `GET  /api/v1/activity/task/:id`: Task activity timeline

### ☕ Breaks (`/api/v1/breaks`)
- `POST /api/v1/breaks/start`: Start member break (auto-pauses active task)
- `POST /api/v1/breaks/end`: End break & update attendance break seconds
- `GET  /api/v1/breaks/active`: Active breaks (Admin/Manager)

### 📊 CRM Operations (`/api/v1/crm`)
- `/clients`: Client management
- `/projects`: Project management
- `/leads`: Lead management & follow-ups
- `/payments`: Payment recording & invoice settlement
- `/quotations`: Quotation generation
- `/invoices`: Invoice generation & balance tracking
- `/freelancers`: Freelancer directory
- `/shoots`: Shoot planning & team assignment
- `/deliveries`: Delivery milestone tracking
- `/files`: File record logging

### 📅 Attendance, Reports & Audit
- `/api/v1/attendance`: Daily attendance & working hours
- `/api/v1/reports/productivity`: Team productivity and completion metrics
- `/api/v1/reports/activity`: Work sessions log report
- `/api/v1/audit`: Tamper-proof audit logs (Admin only)
- `/api/v1/settings`: Dynamic CRM system configuration
