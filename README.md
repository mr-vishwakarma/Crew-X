# Nirikshan (निरीक्षण)
> **Modern, Responsive, Offline-First Field Inspection & Compliance Management Platform**

[![Phase](https://img.shields.io/badge/Phase-1%20Completed-success.svg)](./README.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)

---

## 📋 Table of Contents
1. [Overview & Phase 1 Scope](#overview--phase-1-scope)
2. [Technology Stack](#technology-stack)
3. [Architecture & Folder Structure](#architecture--folder-structure)
4. [User Roles & Authorization Hierarchy](#user-roles--authorization-hierarchy)
5. [Prerequisites & Environment Configuration](#prerequisites--environment-configuration)
6. [MongoDB Atlas Setup Guide](#mongodb-atlas-setup-guide)
7. [Installation & Startup Commands](#installation--startup-commands)
8. [Database Seeding & First Administrator Account](#database-seeding--first-administrator-account)
9. [Testing the Authentication Roles](#testing-the-authentication-roles)
10. [Security Implementations](#security-implementations)
11. [Verification & Automated Test Suite](#verification--automated-test-suite)
12. [Created & Modified Files](#created--modified-files)
13. [Phase 2 Roadmap](#phase-2-roadmap)

---

## 1. Overview & Phase 1 Scope

**Nirikshan** is a production-oriented platform built for construction companies, industrial facilities, and field inspection organizations to conduct audits, enforce compliance standards, and capture observations with offline-first synchronization.

### Phase 1 Focus:
- Enterprise-grade login experience with clean responsive UI (Mobile, Tablet, Desktop).
- Full-stack TypeScript foundation with Express.js, Mongoose, and React.
- Secure authentication flow leveraging HTTP-only JWT cookies and bcrypt password hashing.
- Role-based authorization middleware (RBAC) on both backend API routes and frontend client routes.
- Sanitized health check endpoint reporting MongoDB connection status without credential exposure.
- Role-specific dashboard landing pages for **Administrator**, **Supervisor**, and **Inspector**.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Bundler & Tooling:** Vite 6
- **Styling:** Tailwind CSS v4 (Mobile-first responsive styling, Slate/Navy enterprise palette)
- **State Management:** Zustand
- **Forms & Validation:** React Hook Form + Zod (`@hookform/resolvers`)
- **Routing:** React Router v7
- **Icons:** Lucide React
- **HTTP Client:** Axios (configured with `withCredentials: true`)

### Backend
- **Runtime:** Node.js (v20+ / v22+ / v24+)
- **Framework:** Express.js 4.21 + TypeScript
- **Database & ODM:** MongoDB Atlas + Mongoose 8.9
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) + HTTP-Only Cookies (`cookie-parser`)
- **Password Security:** `bcryptjs` (salted 10-round hashing)
- **Validation:** Zod request body validation middleware
- **Security:** Helmet HTTP headers + configured CORS with credentials
- **Logging:** Morgan

---

## 3. Architecture & Folder Structure

```
Nirikshan/
├── package.json                   # Root orchestrator scripts
├── .gitignore                     # Git ignore rules
├── README.md                      # Comprehensive project documentation
│
├── backend/                       # Node.js + Express + TypeScript Backend
│   ├── .env.example               # Backend environment template
│   ├── package.json               # Backend dependencies and scripts
│   ├── tsconfig.json              # TypeScript configuration
│   ├── test/                      # Backend automated test suite
│   │   └── auth.unit.test.ts      # Unit tests for JWT, bcrypt, RBAC & health
│   └── src/
│       ├── config/
│       │   ├── db.ts              # Mongoose connection & lifecycle handlers
│       │   └── env.ts             # Typed environment configuration
│       ├── controllers/
│       │   └── auth.controller.ts # Login, logout, getMe handlers
│       ├── middleware/
│       │   ├── auth.middleware.ts # JWT verification & RBAC authorization
│       │   ├── error.middleware.ts# Centralized error handling & 404
│       │   └── validation.middleware.ts # Zod request body validation
│       ├── models/
│       │   └── user.model.ts      # Mongoose User schema & password methods
│       ├── routes/
│       │   ├── auth.routes.ts     # /api/auth endpoints
│       │   ├── health.routes.ts   # /api/health endpoint
│       │   └── index.ts           # Central router aggregator
│       ├── scripts/
│       │   └── seed.ts            # Database seeding script for test accounts
│       ├── services/
│       │   └── auth.service.ts    # Authentication business logic
│       ├── types/
│       │   └── auth.types.ts      # UserRole, IUser, JwtPayload, Request types
│       ├── utils/
│       │   ├── jwt.ts             # JWT token sign and verify helpers
│       │   └── response.ts        # Standardized API response formatters
│       ├── app.ts                 # Express application factory
│       └── server.ts              # HTTP server listener
│
└── frontend/                      # React + TypeScript + Vite Frontend
    ├── .env.example               # Frontend environment template
    ├── package.json               # Frontend dependencies and scripts
    ├── vite.config.ts             # Vite configuration with proxy & Tailwind
    ├── tsconfig.json              # TypeScript project reference
    ├── tsconfig.app.json          # Frontend TS compilation rules
    ├── index.html                 # Main HTML template with Nirikshan branding
    └── src/
        ├── assets/                # Static brand graphics and icons
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.tsx     # Enterprise header with role badge & logout
        │   │   └── LoadingScreen.tsx # Animated session verification loader
        │   └── ui/
        │       ├── Alert.tsx      # Notification & error banner component
        │       ├── Badge.tsx      # Role indicator pill (Admin/Supervisor/Inspector)
        │       ├── Button.tsx     # Reusable button with loading & icon support
        │       ├── Card.tsx       # Standard card container
        │       └── Input.tsx      # Accessible form input with error state
        ├── features/
        │   └── auth/
        │       ├── components/
        │       │   └── LoginForm.tsx # Enterprise login form + demo quick-fill
        │       ├── hooks/
        │       │   └── useAuth.ts # Hook exposing Zustand auth state
        │       ├── schemas/
        │       │   └── login.schema.ts # Zod schema for login validation
        │       └── services/
        │           └── auth.service.ts # API calls to /api/auth
        ├── layouts/
        │   ├── AuthLayout.tsx     # Two-column split login layout
        │   └── DashboardLayout.tsx# Authenticated dashboard wrapper
        ├── pages/
        │   ├── admin/
        │   │   └── AdminDashboardPage.tsx # Administrator dashboard
        │   ├── supervisor/
        │   │   └── SupervisorDashboardPage.tsx # Supervisor dashboard
        │   ├── inspector/
        │   │   └── InspectorDashboardPage.tsx # Field Inspector dashboard
        │   ├── auth/
        │   │   └── LoginPage.tsx  # Login view
        │   ├── NotFoundPage.tsx   # 404 handler
        │   └── UnauthorizedPage.tsx# 403 access denied handler
        ├── routes/
        │   ├── AppRoutes.tsx      # Declarative React Router setup
        │   ├── ProtectedRoute.tsx # Route guard with RBAC checks
        │   └── PublicOnlyRoute.tsx# Redirects logged-in users to dashboard
        ├── services/
        │   └── api.ts             # Axios instance with credentials
        ├── store/
        │   └── useAuthStore.ts    # Zustand global session store
        ├── types/
        │   └── auth.types.ts      # User, Role, Credentials interfaces
        ├── App.tsx                # Root App component with session bootstrap
        ├── main.tsx               # DOM mounting
        └── index.css              # Tailwind CSS imports & global styles
```

---

## 4. User Roles & Authorization Hierarchy

| Role | Hierarchy Level | Primary Responsibilities | Default Redirect Destination |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | Organization Tier (Highest) | Manages projects, sites, supervisors, inspectors, checklists & system settings | `/admin/dashboard` |
| **`SUPERVISOR`** | Operations Tier | Oversees assigned projects, schedules inspections, reviews reports, manages assigned inspectors | `/supervisor/dashboard` |
| **`INSPECTOR`** | Field Operations Tier | Completes checklists, captures GPS & photo evidence, works offline, syncs reports | `/inspector/dashboard` |

> 🔒 **Dual-Layer Enforcement:**
> 1. **Backend Middleware (`authorize(['ADMIN'])`):** Any request without the matching JWT claim is rejected with HTTP `403 Forbidden`.
> 2. **Frontend Guards (`ProtectedRoute`):** Navigating directly via browser URL to unauthorized routes redirects the user to `/unauthorized`.

---

## 5. Prerequisites & Environment Configuration

### Prerequisites
- **Node.js** (v20+ recommended)
- **npm** (v10+)
- **MongoDB Atlas** cluster account (or local MongoDB 6+)

### Backend Environment Configuration
Create `backend/.env` based on `backend/.env.example`:

```bash
# backend/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster-url>/nirikshan?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_must_be_at_least_32_characters_long!
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Configuration
Create `frontend/.env` based on `frontend/.env.example`:

```bash
# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

---

## 6. MongoDB Atlas Setup Guide

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (e.g. M0).
3. Navigate to **Security → Database Access**:
   - Click **Add New Database User**.
   - Choose **Password Authentication**.
   - Create a user (e.g., `nirikshan_admin`) and generate a secure password.
   - Assign the **Read and write to any database** privilege.
4. Navigate to **Security → Network Access**:
   - Click **Add IP Address**.
   - Add your current IP or allow access from anywhere (`0.0.0.0/0`) during development.
5. Navigate to **Database → Connect**:
   - Choose **Drivers** (Node.js).
   - Copy the connection string:
     `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
   - Paste it into `backend/.env` as `MONGODB_URI`, replacing `<username>` and `<password>` and specifying the database name `/nirikshan`.

---

## 7. Installation & Startup Commands

### Method A: Single Command from Root (Recommended)

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Run Backend (in Terminal 1):**
   ```bash
   npm run dev:backend
   ```
   *Server starts at: `http://localhost:5000`*

3. **Run Frontend (in Terminal 2):**
   ```bash
   npm run dev:frontend
   ```
   *Application opens at: `http://localhost:5173`*

---

### Method B: Separate Directories

```bash
# 1. Backend
cd backend
npm install
npm run dev

# 2. Frontend
cd ../frontend
npm install
npm run dev
```

---

## 8. Database Seeding & First Administrator Account

To populate your MongoDB database with the default organization and test accounts for each role:

```bash
# From workspace root:
npm run seed

# Or from backend directory:
cd backend
npm run seed
```

### Default Seeded Accounts:
| Role | Email Address | Password | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@nirikshan.com` | `Admin@12345` | Global Organization Scope |
| **Supervisor** | `supervisor@nirikshan.com` | `Supervisor@12345` | Operations & Assigned Sites |
| **Inspector** | `inspector@nirikshan.com` | `Inspector@12345` | Field Checklists & Observations |

---

## 9. Testing the Authentication Roles

### 1. Verification of Role Redirection:
1. Open `http://localhost:5173/login` in your browser.
2. Click the **Admin** quick-fill button (or enter `admin@nirikshan.com` / `Admin@12345`).
   - Click **Sign In**.
   - Verified destination: redirected to `/admin/dashboard`.
3. Sign out and click **Supervisor** (`supervisor@nirikshan.com` / `Supervisor@12345`).
   - Click **Sign In**.
   - Verified destination: redirected to `/supervisor/dashboard`.
4. Sign out and click **Inspector** (`inspector@nirikshan.com` / `Inspector@12345`).
   - Click **Sign In**.
   - Verified destination: redirected to `/inspector/dashboard`.

### 2. Verification of Route Protection & Forbidden Access:
1. Sign in as an **Inspector** (`inspector@nirikshan.com`).
2. Manually enter `http://localhost:5173/admin/dashboard` in the browser address bar.
3. Observe: You are immediately intercepted and routed to `/unauthorized` (403 Access Denied page) explaining that your role lacks permissions.
4. Click **My Dashboard** to safely return to `/inspector/dashboard`.

### 3. Verification of Unauthenticated Access:
1. Sign out.
2. Manually navigate to `http://localhost:5173/admin/dashboard`.
3. Observe: You are immediately redirected to `/login`.

### 4. Verification of Invalid Credentials:
1. Enter `admin@nirikshan.com` with an incorrect password (`WrongPass!`).
2. Observe: A clean red alert displays: *"Invalid email or password"*.

---

## 10. Security Implementations

1. **Password Encryption:**
   - Plaintext passwords are never persisted.
   - Salted `bcrypt` (10 rounds) hashes passwords before database writes.
   - The `passwordHash` field is excluded by default in Mongoose queries (`select: false`).

2. **HTTP-Only Cookie Session:**
   - The JWT is stored in an `HttpOnly` cookie (`nirikshan_token`), shielding it from XSS token theft.
   - Set with `sameSite: 'lax'` (development) / `'strict'` (production) and `secure: true` in production.

3. **Backend Role Authorization Middleware:**
   - Frontend route hiding is backed by server-level validation (`authorize(['ADMIN'])`).
   - Any API request with an unauthorized or tampered role token yields HTTP `403 Forbidden`.

4. **Sanitized Health Endpoint:**
   - `GET /api/health` reports server uptime, database connection state, and timestamp without exposing connection URIs, database credentials, or secret keys.

5. **Secrets Management:**
   - All credentials, ports, and JWT keys are loaded exclusively from `.env` files.
   - `.env` files are tracked in `.gitignore`.

---

## 11. Verification & Automated Test Suite

Run the backend verification suite to validate JWT signing, verification, password hashing, role authorization middleware, validation, and health checks:

```bash
# Run backend test suite
cd backend
npm test
```

### Test Results Summary:
```
🧪 Starting Nirikshan Backend Unit & Middleware Verification Suite...

1. Testing Password Hashing & Verification (bcryptjs)...
   ✔ Password hashing and verification functions accurately

2. Testing JWT Signing & Verification...
   ✔ JWT signs and decodes claims accurately

3. Testing Request Validation Middleware (Zod)...
   ✔ Request validation middleware enforces schema integrity

4. Testing Role Authorization Middleware (RBAC)...
   ✔ Role authorization middleware strictly restricts endpoints

5. Testing Express Application & Health Endpoint...
   ✔ Health endpoint successfully queried without revealing credentials
   ✔ Centralized 404 handler returns structured JSON error

====================================================
✅ ALL BACKEND UNIT & MIDDLEWARE TESTS PASSED (6/6)
====================================================
```

---

## 12. Created & Modified Files

### Configuration & Root
- [package.json](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/package.json) — Root project scripts
- [.gitignore](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/.gitignore) — Root git ignore rules
- [README.md](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/README.md) — Comprehensive technical documentation

### Backend (`/backend`)
- [backend/package.json](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/package.json) — Backend dependencies and scripts
- [backend/tsconfig.json](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/tsconfig.json) — Backend TypeScript configuration
- [backend/.env.example](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/.env.example) — Backend environment template
- [backend/src/types/auth.types.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/types/auth.types.ts) — Authentication type definitions
- [backend/src/config/env.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/config/env.ts) — Typed environment configuration
- [backend/src/config/db.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/config/db.ts) — Mongoose database connection
- [backend/src/models/user.model.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/models/user.model.ts) — User schema, bcrypt method, indexes
- [backend/src/utils/jwt.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/utils/jwt.ts) — JWT sign and verify helpers
- [backend/src/utils/response.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/utils/response.ts) — Standard API response formatters
- [backend/src/middleware/auth.middleware.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/middleware/auth.middleware.ts) — Authentication and role authorization
- [backend/src/middleware/validation.middleware.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/middleware/validation.middleware.ts) — Zod payload validation
- [backend/src/middleware/error.middleware.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/middleware/error.middleware.ts) — 404 and central error handling
- [backend/src/services/auth.service.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/services/auth.service.ts) — Authentication business logic
- [backend/src/controllers/auth.controller.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/controllers/auth.controller.ts) — Controller endpoints
- [backend/src/routes/auth.routes.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/routes/auth.routes.ts) — `/api/auth` routes
- [backend/src/routes/health.routes.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/routes/health.routes.ts) — `/api/health` route
- [backend/src/routes/index.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/routes/index.ts) — Main router aggregator
- [backend/src/app.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/app.ts) — Express application factory
- [backend/src/server.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/server.ts) — Server listener
- [backend/src/scripts/seed.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/src/scripts/seed.ts) — Database seeding script
- [backend/test/auth.unit.test.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/backend/test/auth.unit.test.ts) — Automated test suite

### Frontend (`/frontend`)
- [frontend/package.json](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/package.json) — Frontend dependencies and scripts
- [frontend/vite.config.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/vite.config.ts) — Vite configuration with Tailwind and proxy
- [frontend/index.html](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/index.html) — HTML template with branding
- [frontend/src/index.css](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/index.css) — Tailwind CSS styling
- [frontend/.env.example](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/.env.example) — Frontend environment template
- [frontend/src/types/auth.types.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/types/auth.types.ts) — Auth TypeScript interfaces
- [frontend/src/services/api.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/services/api.ts) — Axios client with credentials
- [frontend/src/features/auth/services/auth.service.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/features/auth/services/auth.service.ts) — Auth API client
- [frontend/src/features/auth/schemas/login.schema.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/features/auth/schemas/login.schema.ts) — Zod login validation schema
- [frontend/src/store/useAuthStore.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/store/useAuthStore.ts) — Zustand authentication store
- [frontend/src/features/auth/hooks/useAuth.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/features/auth/hooks/useAuth.ts) — Session hook
- [frontend/src/components/ui/Button.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/ui/Button.tsx) — Reusable button component
- [frontend/src/components/ui/Input.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/ui/Input.tsx) — Form input component
- [frontend/src/components/ui/Badge.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/ui/Badge.tsx) — Role badge component
- [frontend/src/components/ui/Alert.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/ui/Alert.tsx) — Alert notification banner
- [frontend/src/components/ui/Card.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/ui/Card.tsx) — Enterprise card container
- [frontend/src/components/common/Navbar.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/common/Navbar.tsx) — Header bar with sign-out
- [frontend/src/components/common/LoadingScreen.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/common/LoadingScreen.tsx) — Full-page loader
- [frontend/src/layouts/AuthLayout.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/layouts/AuthLayout.tsx) — Responsive two-column login layout
- [frontend/src/layouts/DashboardLayout.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/layouts/DashboardLayout.tsx) — Dashboard layout wrapper
- [frontend/src/features/auth/components/LoginForm.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/features/auth/components/LoginForm.tsx) — Login form with show/hide password
- [frontend/src/routes/ProtectedRoute.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/routes/ProtectedRoute.tsx) — Route protection guard
- [frontend/src/routes/PublicOnlyRoute.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/routes/PublicOnlyRoute.tsx) — Public redirect guard
- [frontend/src/routes/AppRoutes.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/routes/AppRoutes.tsx) — Route declarations
- [frontend/src/pages/auth/LoginPage.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/pages/auth/LoginPage.tsx) — Login page
- [frontend/src/pages/admin/AdminDashboardPage.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/pages/admin/AdminDashboardPage.tsx) — Admin dashboard
- [frontend/src/pages/supervisor/SupervisorDashboardPage.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/pages/supervisor/SupervisorDashboardPage.tsx) — Supervisor dashboard
- [frontend/src/pages/inspector/InspectorDashboardPage.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/pages/inspector/InspectorDashboardPage.tsx) — Inspector dashboard
- [frontend/src/pages/UnauthorizedPage.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/pages/UnauthorizedPage.tsx) — 403 Forbidden page
- [frontend/src/pages/NotFoundPage.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/pages/NotFoundPage.tsx) — 404 Not Found page
- [frontend/src/App.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/App.tsx) — Application root
- [frontend/src/main.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/main.tsx) — Application entry point

---

## 13. Phase 2 Roadmap

With the authentication and authorization foundation established, Phase 2 will implement:
1. **Organization, Project & Site Management:** Multi-tier entity hierarchies.
2. **Dynamic Checklist Templates:** Configurable section builders with conditional logic.
3. **Task Assignment Engine:** Supervisors assigning inspections to field inspectors.
4. **Offline-First Synchronization Engine:** Workbox PWA + Dexie.js (IndexedDB).
5. **GPS Location Validation & Photo Evidence:** Geofencing and image upload pipelines.
