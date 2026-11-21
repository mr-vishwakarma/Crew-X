# Nirikshan (निरीक्षण)
> **Modern, Responsive, Offline-First Field Inspection & Compliance Management Platform**

[![Phase](https://img.shields.io/badge/Phase-1%20%26%202%20Completed-success.svg)](./README.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Dexie.js](https://img.shields.io/badge/IndexedDB-Dexie.js%20v4-orange.svg)](https://dexie.org/)

---

## 📋 Table of Contents
1. [Overview & Project Objectives](#overview--project-objectives)
2. [Technology Stack](#technology-stack)
3. [Architecture & Folder Structure](#architecture--folder-structure)
4. [User Roles & Authorization Hierarchy](#user-roles--authorization-hierarchy)
5. [Role-Based Dashboards (Phase 2)](#role-based-dashboards-phase-2)
6. [Responsive Navigation Architecture](#responsive-navigation-architecture)
7. [Dexie.js IndexedDB Foundation (Phase 2)](#dexiejs-indexeddb-foundation-phase-2)
8. [Prerequisites & Environment Configuration](#prerequisites--environment-configuration)
9. [MongoDB Atlas Setup Guide](#mongodb-atlas-setup-guide)
10. [Installation & Startup Commands](#installation--startup-commands)
11. [Database Seeding & Test Accounts](#database-seeding--test-accounts)
12. [Testing & Validation Guide](#testing--validation-guide)
13. [Created & Modified Files](#created--modified-files)
14. [Phase 3 Roadmap](#phase-3-roadmap)

---

## 1. Overview & Project Objectives

**Nirikshan** is an offline-first field inspection and compliance management platform engineered for industries such as construction, infrastructure, manufacturing, and utilities.

### Phase 1 Focus (Completed):
- Full-stack authentication with Express.js, TypeScript, and MongoDB Atlas.
- Salted 10-round bcrypt password hashing and HTTP-Only JWT session cookies.
- Responsive, enterprise-grade login interface with show/hide password and validation.
- Initial role authorization middleware and route protection.

### Phase 2 Focus (Completed):
- **Role-Based Dashboards:** Specialized, rich dashboards for **Administrator**, **Supervisor**, and **Inspector**.
- **Responsive Navigation:** Collapsible desktop sidebar, off-canvas mobile drawer, and mobile-first bottom navigation for field inspectors.
- **IndexedDB via Dexie.js:** Local database (`NirikshanLocalDB`) with versioned schema (`inspections`, `photos`, `syncQueue`).
- **Reactive Connectivity Hook:** Real-time online/offline network detection with Dexie status reporting.
- **Module Routes:** Role-protected routes for all navigation destinations, ensuring zero broken links or 404s.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Bundler & Tooling:** Vite 6
- **Styling:** Tailwind CSS v4 (Slate/Navy enterprise palette, responsive mobile-first utilities)
- **Local Database:** Dexie.js (v4) for browser-side IndexedDB management
- **State Management:** Zustand
- **Forms & Validation:** React Hook Form + Zod (`@hookform/resolvers`)
- **Routing:** React Router v7 with RBAC route protection
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
├── package.json                          # Root orchestrator scripts
├── .gitignore                            # Root git ignore (node_modules, .env, dist)
├── README.md                             # Technical documentation
│
├── backend/                              # Express + TypeScript + MongoDB Backend
│   ├── .env.example                      # Backend environment template
│   ├── .env                              # Local development environment (git-ignored)
│   ├── package.json                      # Backend dependencies & build scripts
│   ├── tsconfig.json                     # Strict TypeScript configuration
│   ├── test/
│   │   └── auth.unit.test.ts             # Unit tests (JWT, bcrypt, RBAC, health)
│   └── src/
│       ├── config/                       # Database and environment configs
│       ├── controllers/                  # Express route controllers
│       ├── middleware/                   # Auth, RBAC, error & validation middleware
│       ├── models/                       # Mongoose schemas (User)
│       ├── routes/                       # Express API routes
│       ├── scripts/                      # Database seed script
│       ├── services/                     # Business logic services
│       ├── types/                        # Auth & user type definitions
│       └── utils/                        # JWT and response utilities
│
└── frontend/                             # React 19 + TypeScript + Vite + Dexie Frontend
    ├── .env.example                      # Frontend environment template
    ├── .env                              # Local frontend environment (git-ignored)
    ├── package.json                      # Frontend dependencies & build scripts
    ├── vite.config.ts                    # Vite config with API proxy & Tailwind v4
    └── src/
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.tsx            # Simple header fallback
        │   │   └── LoadingScreen.tsx     # Full-page loader
        │   ├── navigation/
        │   │   ├── Sidebar.tsx           # Collapsible desktop sidebar
        │   │   ├── Header.tsx            # Top header with connectivity & profile
        │   │   ├── MobileDrawer.tsx      # Off-canvas mobile/tablet drawer
        │   │   └── InspectorBottomNav.tsx# Mobile-first inspector bottom bar
        │   └── ui/
        │       ├── Alert.tsx             # Notification banner component
        │       ├── Badge.tsx             # Role indicator badge
        │       ├── Button.tsx            # Reusable button with spinner
        │       ├── Card.tsx              # Standard card container
        │       ├── ConnectionStatus.tsx  # Reactive online/offline pill
        │       ├── Input.tsx             # Form input component
        │       └── StatCard.tsx          # Metric statistic card
        ├── database/
        │   ├── db.ts                     # Dexie NirikshanLocalDB class singleton
        │   ├── schema.ts                 # LocalInspection, LocalPhoto, SyncQueue types
        │   └── databaseHelpers.ts        # DB health, count, and draft helpers
        ├── features/
        │   └── auth/                     # Auth hooks, schemas, and services
        ├── hooks/
        │   └── useNetworkStatus.ts       # Reactive browser online/offline hook
        ├── layouts/
        │   ├── AuthLayout.tsx            # Two-column login layout
        │   ├── AuthenticatedLayout.tsx   # Enterprise application shell
        │   └── DashboardLayout.tsx       # Standard frame wrapper
        ├── pages/
        │   ├── admin/
        │   │   └── AdminDashboardPage.tsx      # Administrator dashboard
        │   ├── supervisor/
        │   │   └── SupervisorDashboardPage.tsx # Supervisor dashboard
        │   ├── inspector/
        │   │   └── InspectorDashboardPage.tsx  # Field Inspector dashboard
        │   ├── common/
        │   │   └── ModulePlaceholderPage.tsx   # Reusable module view
        │   ├── auth/
        │   │   └── LoginPage.tsx         # Login view
        │   ├── NotFoundPage.tsx          # 404 handler
        │   └── UnauthorizedPage.tsx      # 403 Forbidden handler
        ├── routes/
        │   ├── AppRoutes.tsx             # Complete route configuration
        │   ├── ProtectedRoute.tsx        # RBAC route protection guard
        │   ├── PublicOnlyRoute.tsx       # Public redirect guard
        │   └── navigationConfig.ts       # Typed navigation menu definitions
        ├── services/
        │   └── api.ts                    # Axios instance with credentials
        ├── store/
        │   └── useAuthStore.ts           # Zustand global authentication store
        └── types/
            └── auth.types.ts             # Auth type interfaces
```

---

## 4. User Roles & Authorization Hierarchy

| Role | Hierarchy Level | Primary Responsibilities | Default Destination |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | Organization Tier (Highest) | Manages projects, sites, supervisors, inspectors, checklists & system settings | `/admin/dashboard` |
| **`SUPERVISOR`** | Operations Tier | Oversees assigned projects, schedules inspections, reviews reports, manages assigned inspectors | `/supervisor/dashboard` |
| **`INSPECTOR`** | Field Operations Tier | Completes checklists, captures GPS & photo evidence, works offline, syncs reports | `/inspector/dashboard` |

---

## 5. Role-Based Dashboards (Phase 2)

### A. Administrator Dashboard (`/admin/dashboard`)
- **Key Metrics:** Total Projects (14), Total Sites (48), Total Supervisors (12), Total Inspectors (86), Active Inspections (32), Overdue Inspections (3).
- **Inspection Overview:** Visual compliance progress distribution (Completed: 88.4%, In Progress: 8.2%, Flagged: 3.4%) with 96.6% compliance rate against target KPI.
- **Recent Organization Activity:** Live stream of organization audit events with site tags, user roles, and severity status.
- **Quick Actions:** Create Project, Add Site, Provision Supervisor, New Checklist Template.

### B. Supervisor Dashboard (`/supervisor/dashboard`)
- **Key Metrics:** Assigned Projects (3), Managed Inspectors (16), Active Assignments (24), Pending Reviews (7), Overdue Inspections (1).
- **Assigned Projects Status:** Progress tracker showing inspection completion rate for authorized projects only (*Metro Underground Line 4*, *Solar Grid Facilities*, *Highway Viaduct*).
- **Pending Reviews & Conflicts:** Actionable queue of submitted inspections awaiting QA sign-off or conflict resolution.
- **Quick Actions:** Assign Work Order, Review Submissions, Manage Inspectors, Conflicts.

### C. Inspector Dashboard (`/inspector/dashboard`)
- **Mobile-First Design:** Optimized for field use on smartphones and tablets.
- **Live Field & Storage Health Bar:** Displays reactive browser connectivity (`Online`/`Offline`), Dexie `NirikshanLocalDB` state, and browser persistent storage status.
- **Key Metrics:** Assigned (5), Due Today (2), Completed (14), Local Drafts (from IndexedDB), Pending Sync Count (from Dexie `syncQueue`).
- **My Upcoming Inspections:** Cards with priority badges, GPS coordinates, due dates, and quick "Open Form" triggers.
- **Local IndexedDB Panel:** Live inspection of records in `inspections`, `photos`, and `syncQueue`, with an interactive button to insert a test offline draft into Dexie for immediate verification in browser DevTools.

---

## 6. Responsive Navigation Architecture

### Navigation Configurations:
1. **Administrator (11 destinations):** Dashboard, Projects, Sites, Supervisors, Inspectors, Assignments, Checklist Templates, Inspections, Reports, Sync Monitoring, Organization Settings.
2. **Supervisor (9 destinations):** Dashboard, My Projects, Sites, Inspectors, Assignments, Inspections, Conflict Resolution, Reports, Sync Monitoring.
3. **Inspector (7 destinations):** Home, My Inspections, Checklist, Evidence, Sync Centre, Reports, Profile.

### Form-Factor Adaptations:
- **Desktop (>= 1024px):** Collapsible 64-width / 20-width left sidebar with brand logo, badges, tooltips on collapsed state, and user profile drawer.
- **Tablet (768px - 1023px):** Compact sidebar with collapsible state or slide-over drawer.
- **Mobile (< 768px):**
  - **Administrator & Supervisor:** Responsive off-canvas slide-over drawer triggered by the header hamburger button.
  - **Inspector:** Fixed bottom navigation bar with 5 primary destinations (Home, Inspections, Checklist, Sync, More) designed for thumb-friendly one-handed field operation.

---

## 7. Dexie.js IndexedDB Foundation (Phase 2)

Browser-side database initialized as **`NirikshanLocalDB`** using **Dexie.js v4**.

### Version 1 Schema & Indexes:
```typescript
db.version(1).stores({
  inspections: '&id, assignmentId, siteId, syncStatus, updatedAt',
  photos: '&id, inspectionId, syncStatus, createdAt',
  syncQueue: '&id, entityId, entityType, status, createdAt',
});
```

### Table Structure:
1. **`inspections`:** Stores locally drafted or cached inspections (`id`, `assignmentId`, `siteId`, `answers`, `notes`, `latitude`, `longitude`, `gpsAccuracy`, `serverVersion`, `localRevision`, `syncStatus`, `updatedAt`).
2. **`photos`:** Stores captured photographs as binary **Blobs** (`id`, `inspectionId`, `blob`, `fileName`, `mimeType`, `syncStatus`, `createdAt`). Avoids expensive base64 encoding overhead.
3. **`syncQueue`:** Tracks mutations waiting to be synced to the Express/MongoDB cloud backend (`id`, `entityId`, `entityType`, `status`, `attempts`, `createdAt`).

### How to Inspect in Browser DevTools:
1. Open the Inspector Dashboard at `http://localhost:5173/inspector/dashboard`.
2. Press **F12** (or Right-Click → **Inspect**).
3. Navigate to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox).
4. Expand **IndexedDB** → **NirikshanLocalDB**.
5. View the tables: `inspections`, `photos`, `syncQueue`.
6. Click the **"+ Add Test Draft to IndexedDB"** button on the Inspector dashboard to instantly observe records populated in `inspections` and `syncQueue`!

---

## 8. Prerequisites & Environment Configuration

### Prerequisites
- **Node.js** (v20+ recommended)
- **npm** (v10+)
- **MongoDB Atlas** cluster account (or local MongoDB 6+)

### Backend (`backend/.env`)
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster-url>/nirikshan?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_must_be_at_least_32_characters_long!
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 9. MongoDB Atlas Setup Guide

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (e.g. M0).
3. Under **Database Access**, create a user with **Read and write to any database** privilege.
4. Under **Network Access**, add `0.0.0.0/0` (for development access).
5. Under **Database → Connect → Drivers**, copy the connection string and paste into `backend/.env` as `MONGODB_URI`.

---

## 10. Installation & Startup Commands

```bash
# 1. Install all dependencies across root, backend, and frontend
npm run install:all

# 2. Start the Backend server (Terminal 1)
npm run dev:backend
# Listening on http://localhost:5000

# 3. Start the Frontend client (Terminal 2)
npm run dev:frontend
# Running at http://localhost:5173
```

---

## 11. Database Seeding & Test Accounts

Run the seeding script to create test accounts in MongoDB:

```bash
npm run seed
```

### Pre-Configured Test Accounts:
| Role | Email Address | Password | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@nirikshan.com` | `Admin@12345` | Global Organization Scope |
| **Supervisor** | `supervisor@nirikshan.com` | `Supervisor@12345` | Operations & Assigned Projects |
| **Inspector** | `inspector@nirikshan.com` | `Inspector@12345` | Field Checklists & Local IndexedDB |

---

## 12. Testing & Validation Guide

### A. Role Redirection & Dashboard Verification:
1. Open `http://localhost:5173/login`.
2. Click **Admin** quick-fill and sign in → redirected to `/admin/dashboard`.
3. Sign out. Click **Supervisor** quick-fill and sign in → redirected to `/supervisor/dashboard`.
4. Sign out. Click **Inspector** quick-fill and sign in → redirected to `/inspector/dashboard`.

### B. Navigation & Sidebar Testing:
1. Toggle the sidebar collapse arrow button → Observe smooth width transition and tooltip display.
2. In mobile viewport (`< 768px`), open the top-left menu button → Mobile drawer opens with full role items.
3. As an Inspector on mobile, observe the bottom navigation bar with direct access to Home, Inspections, Checklist, and Sync.

### C. IndexedDB & Offline Testing:
1. Sign in as an **Inspector** (`inspector@nirikshan.com`).
2. Scroll to the **Local IndexedDB Storage** card on the right.
3. Click **"+ Add Test Draft to IndexedDB"**.
4. Observe: The "Draft Inspections" and "Pending Sync" counts increment immediately.
5. In browser DevTools (F12 → Application → IndexedDB → `NirikshanLocalDB`), view the newly inserted record with GPS coordinates and answer payload in `inspections` and `syncQueue`.
6. Toggle browser offline mode (Network tab → Offline) → Observe the live connectivity pill switch reactively to **Offline (Local Mode)**.

---

## 13. Created & Modified Files

### Phase 2 Additions:
- [frontend/src/database/schema.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/database/schema.ts) — LocalInspection, LocalPhoto, SyncQueueItem schemas
- [frontend/src/database/db.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/database/db.ts) — Dexie NirikshanLocalDB class singleton
- [frontend/src/database/databaseHelpers.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/database/databaseHelpers.ts) — DB health, query, and seeding utilities
- [frontend/src/hooks/useNetworkStatus.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/hooks/useNetworkStatus.ts) — Reactive online/offline event listener
- [frontend/src/routes/navigationConfig.ts](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/routes/navigationConfig.ts) — Typed navigation definitions for all 3 roles
- [frontend/src/components/navigation/Sidebar.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/navigation/Sidebar.tsx) — Collapsible desktop sidebar
- [frontend/src/components/navigation/Header.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/navigation/Header.tsx) — Header with live connectivity and profile dropdown
- [frontend/src/components/navigation/MobileDrawer.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/navigation/MobileDrawer.tsx) — Off-canvas mobile navigation drawer
- [frontend/src/components/navigation/InspectorBottomNav.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/navigation/InspectorBottomNav.tsx) — Mobile bottom bar for inspectors
- [frontend/src/layouts/AuthenticatedLayout.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/layouts/AuthenticatedLayout.tsx) — Unified responsive application shell
- [frontend/src/components/ui/StatCard.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/ui/StatCard.tsx) — Reusable metric statistic card
- [frontend/src/components/ui/ConnectionStatus.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/components/ui/ConnectionStatus.tsx) — Reactive connection status badge
- [frontend/src/pages/common/ModulePlaceholderPage.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/pages/common/ModulePlaceholderPage.tsx) — Reusable module placeholder view
- [frontend/src/pages/admin/AdminDashboardPage.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/pages/admin/AdminDashboardPage.tsx) — Complete Admin dashboard
- [frontend/src/pages/supervisor/SupervisorDashboardPage.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/pages/supervisor/SupervisorDashboardPage.tsx) — Complete Supervisor dashboard
- [frontend/src/pages/inspector/InspectorDashboardPage.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/pages/inspector/InspectorDashboardPage.tsx) — Complete Inspector dashboard with Dexie integration
- [frontend/src/routes/AppRoutes.tsx](file:///c:/Users/shyam/OneDrive/Desktop/Nirikshan/frontend/src/routes/AppRoutes.tsx) — Complete route mapping for all 27 destinations

---

## 14. Phase 3 Roadmap

With the role-based dashboards, responsive navigation, and Dexie IndexedDB foundation complete:
1. **Dynamic Checklist Engine:** Schema-driven interactive checklist runner with conditional validation.
2. **Workbox PWA Integration:** Service Worker asset and API caching for offline availability.
3. **Background Synchronization Pipeline:** Two-way sync between Dexie `syncQueue` and Express `/api/inspections`.
4. **Camera & GPS Tagging:** Native camera integration with watermarking and Blob storage.
