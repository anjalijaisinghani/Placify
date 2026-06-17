# Placify

> Campus Placement Management System — React + Spring Boot full-stack platform for students and recruiters.

![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.3-6DB33F)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Vite](https://img.shields.io/badge/Vite-8-646CFF)
![MySQL](https://img.shields.io/badge/MySQL-8+-4479A1)
![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20BCrypt-black)

---

## What is Placify?

Most college placement workflows still run on spreadsheets, email threads, and WhatsApp groups. That creates fragmented candidate data, repeated manual updates, and poor visibility for every stakeholder.

Placify replaces that with a role-based web platform where:

- **Admins** manage companies and oversee the entire process
- **Recruiters** post jobs, review applicants, and update hiring status
- **Students** maintain a profile, browse active openings, apply, and track their application pipeline in real time

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Axios, SweetAlert2 |
| Build Tool | Vite 8 |
| Backend | Spring Boot 4.0.3, Java 21 |
| Security | Spring Security 6, JWT, BCrypt |
| ORM | Spring Data JPA, Hibernate |
| Database | MySQL 8+ |
| Build | Maven 3.9+ |

---

## Architecture

```
frontend/          ← Vite + React SPA (port 5173 in dev)
│  └── /api/*      → proxied to Spring Boot (port 8080)
│
backend/           ← Spring Boot REST API (port 8080)
│  └── /api/*      → controllers → services → repositories → MySQL
```

The frontend dev server proxies all `/api` requests to the backend — no CORS configuration needed during development. In production, serve the Vite build from any static host and point it at the deployed backend.

### Backend Layer Model

```
Controller → Service → ServiceImpl → Repository → JPA Entity → MySQL
```

- All API responses wrapped in a uniform `ApiResponse<T>` envelope
- DTOs enforce API contracts and shield entities from direct exposure
- `GlobalExceptionHandler` catches validation, business, and 404 errors and returns structured JSON
- `@PreAuthorize` annotations + Spring Security method security enforce role checks at the service boundary

---

## Features

### Authentication
- Register as Student or Recruiter
- JWT login — token stored in `localStorage`, injected into every request via Axios interceptor
- Auto-redirect to `/login` on 401; role-based redirect after login
- Forgot password — email reset link (1-hour expiry, single-use token); set `PLACIFY_MAIL_ENABLED=true` to activate

### Student
- Profile: branch, CGPA, skills (comma-separated), PDF resume upload (max 2 MB)
- Advanced job search — keyword matches title, description, eligibility, location, company name, and salary package via DB-level LIKE queries; separate location filter; company dropdown; active/inactive toggle
- Minimum CGPA eligibility check on apply — job can set a `minCgpa` threshold; application rejected with clear error if student CGPA is below it
- Bookmark / un-bookmark jobs (optimistic UI)
- One-click apply
- Application tracking with an animated timeline (Applied → Under Review → Shortlisted → Interview → Selected / Rejected)

### Recruiter / Admin
- Create and manage job postings (title, company, location, salary package, deadline, minimum CGPA, eligibility, description)
- Activate / deactivate jobs
- View per-job applicant pipeline in a table with inline status updates
- Export applicant list to CSV
- Admin-only: add companies to the directory
- Admin-only: platform analytics dashboard — total students, jobs, applications, placements, placement rate (%), top 5 companies by placements

### Notifications
- In-app: bell icon polls unread count every 30 seconds; click to load and mark all as read; dropdown shows message + timestamp
- Email (optional): async fire-and-forget via SMTP — application confirmation, status-change emails with colour-coded HTML template, password reset link. Set `PLACIFY_MAIL_ENABLED=true` and supply SMTP credentials to activate. Disabled by default — app starts without mail config.

---

## Project Structure

```
Placify/
├── backend/                         ← Spring Boot
│   └── src/main/
│       ├── java/com/placify/
│       │   ├── config/
│       │   │   ├── AsyncConfig.java         ← email thread-pool executor
│       │   │   ├── CorsConfig.java
│       │   │   ├── DataInitializer.java
│       │   │   ├── PasswordConfig.java
│       │   │   └── SecurityConfig.java
│       │   ├── controller/
│       │   │   ├── AdminController.java      ← GET /api/admin/stats
│       │   │   ├── ApplicationController.java
│       │   │   ├── AuthController.java
│       │   │   ├── CompanyController.java
│       │   │   ├── JobController.java
│       │   │   ├── NotificationController.java
│       │   │   ├── RecruiterProfileController.java
│       │   │   ├── StudentController.java
│       │   │   └── UserController.java
│       │   ├── dto/
│       │   │   ├── admin/AdminStatsResponse.java
│       │   │   └── ... (auth, job, application, etc.)
│       │   ├── entity/
│       │   │   ├── Application.java
│       │   │   ├── Company.java
│       │   │   ├── Job.java
│       │   │   ├── Notification.java
│       │   │   ├── PasswordResetToken.java   ← forgot-password flow
│       │   │   ├── RecruiterProfile.java
│       │   │   ├── SavedJob.java
│       │   │   ├── Student.java
│       │   │   └── User.java
│       │   ├── enums/
│       │   │   ├── ApplicationStatus.java
│       │   │   ├── NotificationType.java
│       │   │   └── Role.java
│       │   ├── exception/
│       │   ├── repository/
│       │   │   └── JobSpec.java             ← JPA Specification builder for job search
│       │   ├── security/            ← JWT filter, UserDetailsService
│       │   ├── service/
│       │   │   ├── AdminStatsService.java
│       │   │   ├── EmailService.java
│       │   │   └── impl/
│       │   │       ├── AdminStatsServiceImpl.java
│       │   │       └── EmailServiceImpl.java
│       │   └── PlacifyApplication.java
│       └── resources/
│           ├── application.properties
│           └── static/images/       ← Logo served at /images/Logo.png
│
├── frontend/                        ← Vite + React
│   ├── src/
│   │   ├── api/index.js             ← Axios instance + all API calls
│   │   ├── context/AuthContext.jsx  ← global auth state
│   │   ├── hooks/useToast.js        ← SweetAlert2 toast + confirm
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   ├── JobsPage.jsx
│   │   │   ├── ApplicationsPage.jsx
│   │   │   ├── StudentProfile.jsx
│   │   │   └── RecruiterProfile.jsx
│   │   ├── App.jsx                  ← React Router routes
│   │   ├── main.jsx                 ← entry point
│   │   └── index.css                ← full design system
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   ├── 01_reset_placify_schema.sql
│   ├── 03_seed_placify_data.sql
│   └── 04_login_credentials.md
└── Placify.postman_collection.json
```

---

## Domain Model

| Entity | Key Fields | Notes |
|---|---|---|
| `User` | id, name, email, password, role | Central identity entity |
| `Student` | branch, cgpa, skills, resume | One-to-one with `User` |
| `RecruiterProfile` | company, position, experienceYears, linkedIn, bio | One-to-one with `User` |
| `Company` | name, description | One-to-many with `Job` |
| `Job` | title, description, eligibility, minCgpa, location, salaryPackage, applicationDeadline, active | Many-to-one with `Company` |
| `Application` | student, job, status | Status: `APPLIED → IN_REVIEW → SHORTLISTED → INTERVIEW → SELECTED / REJECTED` |
| `SavedJob` | student, job | Bookmark relationship |
| `Notification` | user, message, type, read | Generated on status changes and new job posts |
| `PasswordResetToken` | token (UUID), user, expiresAt, used | Single-use, 1-hour TTL |

---

## API Reference

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |

`forgot-password` always returns 200 — never reveals whether email exists. `reset-password` validates token expiry and single-use constraint.

### Student
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/students/me` | STUDENT |
| PUT | `/api/students/me` | STUDENT |
| POST | `/api/students/me/resume` | STUDENT |

### Recruiter Profile
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/recruiters/me` | RECRUITER, ADMIN |
| PUT | `/api/recruiters/me` | RECRUITER, ADMIN |

### Companies
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/companies` | Authenticated |
| POST | `/api/companies` | ADMIN |

### Jobs
| Method | Endpoint | Access | Query Params |
|---|---|---|---|
| GET | `/api/jobs` | Authenticated | `keyword`, `location`, `companyId`, `active` |
| POST | `/api/jobs` | RECRUITER, ADMIN | — |
| PUT | `/api/jobs/{id}` | RECRUITER, ADMIN | — |
| DELETE | `/api/jobs/{id}` | RECRUITER, ADMIN | — |
| PATCH | `/api/jobs/{id}/toggle` | RECRUITER, ADMIN | — |

`keyword` performs case-insensitive OR-LIKE across title, description, eligibility, location, company name, and salary package. `location` is an additional AND-LIKE filter on the location field.

### Applications
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/applications/my` | STUDENT |
| POST | `/api/applications` | STUDENT |
| GET | `/api/applications` | RECRUITER, ADMIN |
| GET | `/api/applications/job/{jobId}` | RECRUITER, ADMIN |
| PATCH | `/api/applications/{id}/status` | RECRUITER, ADMIN |

### Saved Jobs
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/saved-jobs/ids` | STUDENT |
| POST | `/api/saved-jobs/{jobId}` | STUDENT |
| DELETE | `/api/saved-jobs/{jobId}` | STUDENT |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/admin/stats` | ADMIN |

Returns: `totalStudents`, `totalJobs`, `activeJobs`, `totalApplications`, `totalPlacements`, `placementRate` (%), `topCompanies` (top 5 by placements).

### Notifications
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/notifications` | Authenticated |
| GET | `/api/notifications/unread-count` | Authenticated |
| PATCH | `/api/notifications/mark-all-read` | Authenticated |

---

## Quick Start

### Prerequisites

- Java 21 (Temurin recommended)
- Maven 3.9+
- MySQL 8+ running on `localhost:3306`
- Node.js 18+ and npm

### 1. Clone

```bash
git clone https://github.com/Kumar-Aditya-Singh/Placify.git
cd Placify
```

### 2. Configure the database

The database is created automatically on first run. If your MySQL root password is not empty, set it:

```bash
# Linux / macOS
export PLACIFY_DB_PASSWORD=your_password

# Windows PowerShell
$env:PLACIFY_DB_PASSWORD = "your_password"
```

Or edit `backend/src/main/resources/application.properties` directly.

### 3. Start the backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.  
Seed data (companies, jobs, demo accounts) loads automatically on first startup.

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The React app will be available at `http://localhost:5173`.  
All `/api` requests are proxied to the backend — no CORS setup needed.

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@placify.com` | `Admin@Placify2026` |
| Recruiter | `recruiter.microsoft@placify.com` | `Recruiter@Placify2026` |
| Student | `ananya.gupta@placify.com` | `Student@Placify2026` |

> Seed data is controlled by `app.seed.enabled` in `application.properties` (default: `true`).

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PLACIFY_DB_USERNAME` | `root` | MySQL username |
| `PLACIFY_DB_PASSWORD` | *(empty)* | MySQL password |
| `PLACIFY_SERVER_PORT` | `8080` | Backend port |
| `PLACIFY_JWT_SECRET` | *(built-in)* | JWT signing key — change in production |
| `PLACIFY_JWT_EXPIRATION_MS` | `86400000` | Token TTL (24 h) |
| `PLACIFY_SEED_ENABLED` | `true` | Load demo data on startup |
| `PLACIFY_UPLOAD_DIR` | `./uploads` | PDF resume storage directory |
| `PLACIFY_MAIL_ENABLED` | `false` | Enable SMTP email sending |
| `PLACIFY_MAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `PLACIFY_MAIL_PORT` | `587` | SMTP port (STARTTLS) |
| `PLACIFY_MAIL_USERNAME` | *(empty)* | SMTP username / Gmail address |
| `PLACIFY_MAIL_PASSWORD` | *(empty)* | SMTP password / Gmail App Password |
| `PLACIFY_MAIL_FROM` | `noreply@placify.com` | From address in sent emails |
| `PLACIFY_FRONTEND_URL` | `http://localhost:5173` | Base URL prepended to password reset links in emails |

---

## Frontend Design System

The entire UI is driven by a single `index.css` design system — no Tailwind, no component library.

- **Palette** — base `#07101f`, surface `#0f1d32`, accent indigo `#6366f1`, cyan `#06b6d4`
- **Type** — Inter (body) + Sora (headings)
- **Shell** — fixed sidebar (240 px) + topbar (64 px) + scrollable `page-content`
- **Cards** — `panel`, `card`, `jcard`, `appcard`, `rjcard`, `scard` — each with hover lifts and border transitions
- **Auth pages** — centered card with fixed glass topbar, radial gradient background
- **Responsive** — sidebar collapses to overlay on mobile (hamburger toggle in topbar)
- **Animations** — `rise-in` keyframe on all major cards and panels

---

## Database Scripts

| File | Purpose |
|---|---|
| `database/01_reset_placify_schema.sql` | Drop and recreate the `placify` schema |
| `database/03_seed_placify_data.sql` | Insert demo companies, jobs, and accounts |
| `database/04_login_credentials.md` | Presentation-ready credential sheet |

---

## Postman Collection

Import `Placify.postman_collection.json` for a complete API test suite.

Suggested flow:
1. `POST /api/auth/login` → copy JWT
2. Set `Authorization: Bearer <token>` header
3. `GET /api/companies` → verify seed data
4. `POST /api/jobs` → post a job as recruiter
5. Login as student → `POST /api/applications` → apply
6. Login as recruiter → `PATCH /api/applications/{id}/status` → move pipeline
