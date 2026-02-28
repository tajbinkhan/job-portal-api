# Job Board API

A secure and scalable job board backend API built with NestJS, PostgreSQL, and Drizzle ORM.

## Description

A RESTful backend API for a job board platform, supporting job listings, job applications, secure
user authentication (JWT + Google OAuth), role-based access control, and CSRF protection. Built with
modern TypeScript tooling and production-ready best practices.

## Features

- 💼 **Job Listings** - Full CRUD for job postings with filtering, search, and pagination
- 📋 **Applications** - Job application submission with Zod-validated payloads
- 🔐 **JWT Authentication** - Stateless auth with HTTP-only cookie token delivery
- 🔑 **Google OAuth 2.0** - One-click sign-in via Passport.js Google strategy
- 🛡️ **CSRF Protection** - Double-submit cookie pattern via `csrf-csrf`
- 👮 **Role-Based Access Control** - Guard-protected routes with custom role decorators
- 🔒 **Password Hashing** - Bcrypt-based secure password storage
- 🔐 **Field Encryption** - AES crypto service for sensitive field encryption
- 📊 **Type-Safe ORM** - Drizzle ORM with full TypeScript inference
- 🌐 **Standardised Responses** - Consistent API response envelope across all endpoints
- 📝 **Request Logging** - Structured per-route request/response logging
- ✅ **Schema Validation** - Zod schemas on every incoming payload

## Tech Stack

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| Framework       | NestJS 11                            |
| Language        | TypeScript 5                         |
| Database        | PostgreSQL                           |
| ORM             | Drizzle ORM                          |
| Validation      | Zod                                  |
| Authentication  | Passport.js (JWT + Google OAuth 2.0) |
| Security        | csrf-csrf, bcryptjs                  |
| Package Manager | pnpm                                 |

## Prerequisites

- **Node.js** v18 or higher
- **pnpm** (`npm install -g pnpm`)
- **Docker** & **Docker Compose** (for the PostgreSQL container)

---

## Local Setup Guide

### 1. Clone the repository

```bash
git clone <repository-url>
cd interview-backend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and populate it with the values below. All variables are
**required** unless marked optional.

```env
# ──────────────────────────────
# Application
# ──────────────────────────────
NODE_ENV=development
PORT=8080

# Public-facing URLs
ORIGIN_URL=http://localhost:3000        # Frontend origin (used for CORS)
API_URL=http://localhost:8080           # Base URL of this API
APP_URL=http://localhost:3000           # Application URL

# ──────────────────────────────
# Database
# ──────────────────────────────
DATABASE_URL="postgresql://job_board:job_board@localhost:5432/job_board"

# ──────────────────────────────
# Secrets  (use long random strings in production)
# ──────────────────────────────
AUTH_SECRET=your_super_secret_auth_key_here
CSRF_SECRET=your_super_secret_csrf_key_here
CRYPTO_SECRET=your_super_secret_crypto_key_here

# ──────────────────────────────
# Cookies
# ──────────────────────────────
COOKIE_DOMAIN=localhost
COOKIE_SAME_SITE=lax          # strict | lax | none
COOKIE_SECURE=false           # Set to true in production (HTTPS only)

# ──────────────────────────────
# Google OAuth 2.0  (optional — remove if not using Google login)
# ──────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
```

> **Generating secrets:** You can generate cryptographically strong secrets with:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Start the PostgreSQL database

```bash
docker-compose up -d
```

This starts a PostgreSQL instance using the credentials defined in your `.env` file. Verify it is
running with `docker ps`.

### 5. Push the database schema

```bash
pnpm db:push
```

This introspects the Drizzle schema files in `src/models/drizzle/` and applies them directly to the
database (no migration files generated). Use this for local development.

### 6. (Optional) Seed the database

```bash
pnpm db:seed
```

Populates the database with sample jobs and user data from `seed.json`.

### 7. Start the development server

```bash
pnpm dev
```

The API will be available at `http://localhost:8080` (or your configured `PORT`). Open
`http://localhost:8080` in a browser to see the interactive landing page with all routes.

---

## Running the Application

```bash
# Development mode with hot-reload
pnpm dev

# Standard start (no watch)
pnpm start

# Production mode (requires build first)
pnpm build
pnpm prod
```

---

## Database Management

```bash
# Open Drizzle Studio (visual database GUI)
pnpm db:studio

# Generate migration files from schema changes
pnpm db:generate

# Run pending migrations
pnpm db:migrate

# Push schema changes directly (no migration files — dev only)
pnpm db:push

# Seed the database with sample data
pnpm db:seed

# Clear all data from the database
pnpm db:clear
```

---

## Available Scripts

| Script             | Description                       |
| ------------------ | --------------------------------- |
| `pnpm dev`         | Start in watch/hot-reload mode    |
| `pnpm start`       | Start without watch               |
| `pnpm build`       | Compile TypeScript to `dist/`     |
| `pnpm prod`        | Run the compiled production build |
| `pnpm format`      | Format all files with Prettier    |
| `pnpm lint`        | Lint and auto-fix with ESLint     |
| `pnpm db:push`     | Push schema to database (dev)     |
| `pnpm db:generate` | Generate Drizzle migration files  |
| `pnpm db:migrate`  | Apply migration files to database |
| `pnpm db:studio`   | Open Drizzle Studio GUI           |
| `pnpm db:seed`     | Seed database with sample data    |
| `pnpm db:clear`    | Wipe all data from the database   |

---

## Project Structure

```
├── docs/                          # Additional documentation
│   ├── CSRF_IMPLEMENTATION.md
│   └── JOBS_API.md
├── src/
│   ├── app.controller.ts          # Root "/" landing page
│   ├── app.module.ts
│   ├── main.ts                    # Bootstrap & global middleware
│   ├── @types/                    # Global type augmentations
│   ├── app/
│   │   ├── auth/                  # Authentication module
│   │   │   ├── strategies/        # JWT & Google Passport strategies
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts      # JWT auth guard
│   │   │   ├── auth.schema.ts     # Zod validation schemas
│   │   │   ├── auth.session.ts    # Session helpers
│   │   │   ├── roles.decorator.ts
│   │   │   └── roles.guard.ts     # RBAC guard
│   │   └── job/                   # Jobs & applications module
│   │       ├── job.controller.ts
│   │       ├── job.service.ts
│   │       ├── job.schema.ts      # Zod schemas for jobs
│   │       ├── job.constants.ts   # Locations, categories, employment types
│   │       ├── application.controller.ts
│   │       └── application.service.ts
│   ├── core/                      # Shared utilities
│   │   ├── api-response.interceptor.ts
│   │   ├── app.helper.ts
│   │   ├── constants.ts
│   │   ├── env.ts                 # Zod environment validation
│   │   ├── http-exception.filter.ts
│   │   ├── pagination.ts
│   │   ├── crypto/                # AES encryption service
│   │   └── validators/            # Reusable Zod rules
│   ├── csrf/                      # CSRF module (guard + decorator + service)
│   ├── database/                  # DB connection, schema barrel, seed & clean scripts
│   └── models/
│       └── drizzle/               # Drizzle table definitions & relations
│           ├── auth.model.ts
│           ├── job.model.ts
│           ├── enum.model.ts
│           └── relation.model.ts
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

---

## API Endpoints

### Jobs

| Method   | Path           | Auth   | Description                                      |
| -------- | -------------- | ------ | ------------------------------------------------ |
| `GET`    | `/jobs`        | Public | List jobs (filterable, paginated)                |
| `GET`    | `/jobs/:id`    | Public | Get a job by ID                                  |
| `GET`    | `/jobs/assets` | Public | Get filter assets (locations, categories, types) |
| `POST`   | `/jobs`        | Admin  | Create a new job                                 |
| `PATCH`  | `/jobs/:id`    | Admin  | Update a job                                     |
| `DELETE` | `/jobs/:id`    | Admin  | Delete a job                                     |

**Query parameters for `GET /jobs`:** `search`, `category`, `location`, `employmentType`, `page`,
`limit`

### Applications

| Method | Path            | Auth   | Description              |
| ------ | --------------- | ------ | ------------------------ |
| `POST` | `/applications` | Public | Submit a job application |

### Authentication

| Method | Path                    | Auth   | Description                 |
| ------ | ----------------------- | ------ | --------------------------- |
| `POST` | `/auth/register`        | Public | Register a new account      |
| `POST` | `/auth/login`           | Public | Login with email & password |
| `POST` | `/auth/logout`          | JWT    | Logout (clears auth cookie) |
| `GET`  | `/auth/me`              | JWT    | Get current user profile    |
| `PUT`  | `/auth/profile`         | JWT    | Update user profile         |
| `GET`  | `/auth/google`          | Public | Initiate Google OAuth flow  |
| `GET`  | `/auth/google/callback` | Public | Google OAuth callback       |

### CSRF

| Method | Path    | Description                                              |
| ------ | ------- | -------------------------------------------------------- |
| `GET`  | `/csrf` | Obtain a CSRF token (required for POST/PUT/PATCH/DELETE) |

> All state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) require a valid CSRF token sent in
> the `x-csrf-token` header.

### Job Reference Data

**Categories:** Engineering, Design, Marketing, Sales, Finance, Operations, Customer Support, Human
Resources, Product, Data & Analytics, Legal, Healthcare, Education

**Employment Types:** Full-Time, Part-Time, Contract, Freelance, Internship

**Locations:** Remote, On-site, Hybrid, and 20+ city options across USA, UK, Europe, Asia, Australia

---

## Security Features

- **JWT** tokens delivered and read exclusively via HTTP-only cookies
- **CSRF** double-submit cookie pattern via `csrf-csrf` on all mutating endpoints
- **bcrypt** password hashing before storage
- **AES** field-level encryption for sensitive data via the `CryptoService`
- **Role-based access control** with `@Roles()` decorator and `RolesGuard`
- **Zod** schema validation on every incoming request body
- **Environment validation** at startup — app refuses to boot on missing/invalid env vars

---

## Documentation

- [CSRF Implementation](docs/CSRF_IMPLEMENTATION.md)
- [Jobs API](docs/JOBS_API.md)
- [Remove Testing Guide](docs/REMOVE_TESTING.md)

---

## License

UNLICENSED — Private project
