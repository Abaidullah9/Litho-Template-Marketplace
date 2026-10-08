# Litho Template Marketplace

[![Node.js](https://img.shields.io/badge/node-%3E%3D24-brightgreen.svg)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/package__manager-pnpm%2012-orange.svg)](https://pnpm.io)
[![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black.svg)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-5.2-blue.svg)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A template marketplace and publishing platform for the **Litho Markdown-to-LaTeX publishing ecosystem**. 

Designed with a dual architecture:
1. **Next.js Static App Router Export (`web/` &rarr; `site/`)**: Delivers lightning-fast, zero-dependency static pages seamlessly deployable to GitHub Pages.
2. **Express 5 Backend Server (`server/`)**: Provides a secured REST API, dynamic catalog endpoints, file upload handling, and a full-featured administrative console backed by Supabase (PostgreSQL).

---

## Table of Contents

- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Setup & Migrations](#database-setup--migrations)
  - [Starting the Application](#starting-the-application)
- [Admin Console & Management](#admin-console--management)
  - [Authentication](#authentication)
  - [Team Administrator Management](#team-administrator-management)
- [Security Architecture](#security-architecture)
- [Development & Build Workflows](#development--build-workflows)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Deployment](#deployment)
- [License](#license)

---

## Features

### Public Marketplace
- **Template Explorer:** Client-side search with multi-token filtering, tag completions, category selection, and responsive pagination.
- **Detailed Template Inspection:** Rich preview displays, verified author credentials, typography specifications, and instant download endpoints.
- **Engagement Analytics:** Anonymous, abuse-resilient engagement counters (views, downloads, and copies).
- **Public Submission Portal (`/submit`):** Direct community submission form allowing creators to propose new templates with metadata and asset uploads.

### Administrative Console (`/admin`)
- **Dashboard Overview:** High-level metrics for templates, categories, tags, pending submissions, views, and downloads.
- **Template Management:** Full CRUD operations and single/bulk lifecycle state actions (*Draft*, *Published*, *Archived*, *Featured*, *Verified*).
- **Submission Moderation:** Dedicated review queue to inspect, validate, approve, or reject incoming community templates.
- **Taxonomy Control:** Category, Tag, and Publisher management with slug validation and reference counts.
- **Team User Management (`/admin/admins`):** Role-based administrator creation (`admin`, `editor`, `viewer`), status monitoring, and revocation.
- **Registry Generator:** One-click snapshot generation writing the static `site/registry.json` catalog.
- **Audit Logging:** Tamper-evident activity trail recording all administrative mutations with timestamps, actors, and metadata.

---

## Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│   Next.js 16 App Router (web/) & Static Site Export (site/)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                REST / Uploads │ Static Pages
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express 5 Server (server/)               │
│  - Public Catalog Router (/api/*)                           │
│  - Protected Admin Router (/api/admin/*)                    │
│  - Authentication & CSRF Verification Layer                 │
│  - Multer File Upload Pipeline                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
               Service Role SQL│ Parameterized Queries
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database (PostgreSQL)           │
│  - Tables: templates, categories, tags, publishers,         │
│            submissions, admin_users, activity_log, settings │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend:** Next.js 16, React 19, TypeScript, Vanilla JS Engines, CSS Custom Properties.
- **Backend:** Express 5.2, Node.js (ES Modules).
- **Database:** Supabase PostgreSQL with triggers, indexes, and full-text search vectors.
- **Authentication:** Cryptographic `scrypt` password hashing + HMAC-SHA256 signed stateless session tokens.
- **Package Manager:** `pnpm` (Workspace-enabled).

---

## Project Structure

```
litho-template-marketplace/
├── server/                      # Express 5 REST API Backend
│   ├── app.js                   # Application factory & route mounting
│   ├── auth.js                  # Scrypt hashing, HMAC sessions & CSRF middleware
│   ├── config.js                # Environment configuration loader
│   ├── errors.js                # Structured API error definitions
│   ├── index.js                 # HTTP listener entrypoint
│   ├── controllers/             # Request handlers (admin & public)
│   ├── models/                  # Database data access layer (Supabase)
│   ├── routes/                  # Express route tables
│   ├── services/                # Activity logging, verification & registry generator
│   └── uploads.js               # Multer file storage & mime validation
├── web/                         # Next.js 16 App Router Application
│   ├── app/                     # App Router pages (/admin, /explore, /submit, etc.)
│   ├── components/              # React components & SiteEngine loaders
│   ├── scripts/                 # Static export (export-to-site.mjs) & parity validator
│   └── styles/                  # Tailwind & global stylesheet bridges
├── site/                        # Static export destination & production files
│   ├── _next/                   # Static content-hashed chunks generated by Next.js
│   ├── admin/                   # Static admin page shells
│   ├── assets/                  # CSS stylesheets, JS engines, and webfonts
│   ├── catalog.json             # Static catalog cache
│   └── registry.json            # Generated template registry
├── supabase/
│   └── migrations/              # PostgreSQL migration scripts
├── scripts/                     # Operational utilities & automation
│   ├── apply-migrations.mjs     # Direct Postgres migration runner
│   ├── seed-marketplace.mjs     # Marketplace sample seeder
│   ├── start.js                 # Local startup runner with preflight checks
│   └── run-tests.mjs            # Built-in test execution runner
└── test/                        # Automated unit & integration test suites
```

---

## Getting Started

### Prerequisites

- **Node.js:** v24.0.0 or higher
- **pnpm:** v12.0.0 or higher (`corepack enable pnpm`)
- **Supabase Account:** A free Supabase project with PostgreSQL enabled

### Installation

Clone the repository and install dependencies using `pnpm`:

```bash
git clone https://github.com/Abaidullah9/Litho-Template-Marketplace.git
cd Litho-Template-Marketplace
pnpm install
```

### Environment Configuration

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase project credentials and administrative secrets:

```ini
# Supabase project URL (Settings → API → Project URL)
SUPABASE_URL=https://your-project.supabase.co

# Public anon key (Settings → API → anon / public)
SUPABASE_ANON_KEY=your-supabase-anon-key

# Service role key (Settings → API → service_role / secret)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Direct Postgres connection string (Settings → Database → Connection string URI)
SUPABASE_DB_URL=postgresql://postgres:your-db-password@db.your-project.supabase.co:5432/postgres?sslmode=require

# Primary Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_SESSION_SECRET=your-random-64-character-hex-secret

# Server settings
PORT=8787
HOST=0.0.0.0
PUBLIC_BASE_URL=http://localhost:8787
NODE_ENV=development
```

### Database Setup & Migrations

Run database migrations to initialize tables, indexes, search triggers, and constraints:

```bash
pnpm run db:migrate
```

*(Optional)* Seed sample community templates and default taxonomy into your database:

```bash
pnpm run db:seed
```

### Starting the Application

Launch the server with the automated startup script:

```bash
node scripts/start.js
```

Or run via `pnpm`:

```bash
pnpm start
```

The application will start on **`http://localhost:8787`**:
- **Marketplace Home:** `http://localhost:8787/`
- **Template Explorer:** `http://localhost:8787/explore`
- **Submit Template:** `http://localhost:8787/submit`
- **Admin Console:** `http://localhost:8787/admin`

---

## Admin Console & Management

### Authentication

1. Navigate to `http://localhost:8787/admin`.
2. Sign in using the credentials defined in your `.env` (`ADMIN_USERNAME` and `ADMIN_PASSWORD`).
3. Upon first sign-in, the account is automatically seeded into the `admin_users` table with an `scrypt` password hash.

### Team Administrator Management (`/admin/admins`)

Administrators can invite and manage additional team members from the dashboard:
- Click **Admins** under the **System** section in the sidebar.
- Click **+ New admin** and enter:
  - **Username:** 3–32 alphanumeric characters (`a-z`, `0-9`, `_`, `.`, `-`).
  - **Password:** Minimum 8 characters.
  - **Role:**
    - `Admin`: Full access to templates, taxonomy, settings, and team users.
    - `Editor`: Content management (templates, submissions, and taxonomy).
    - `Viewer`: Read-only access to templates and activity records.
- Team members can immediately log in with their assigned username and password.

---

## Security Architecture

- **CSRF Protection:** State-changing requests (`POST`, `PUT`, `DELETE`) on the administrative API pass through `verifyAdminOrigin`, validating both `Origin` and `Referer` headers against the host server.
- **HttpOnly Cookies:** Session tokens are stored in `HttpOnly`, `SameSite=Strict` cookies.
- **Cryptographic Password Hashing:** User passwords are never stored in plaintext; passwords use Node's native `crypto.scryptSync` with unique 16-byte random salts.
- **Timing Attack Resistance:** Secrets and signatures are compared using `crypto.timingSafeEqual`.
- **Lockout Prevention:**
  - Administrators cannot delete their own active session.
  - The primary administrator defined in `.env` cannot be deleted.
  - Deleting the last remaining administrator account is prohibited.
- **XSS Mitigation:** All dynamic inputs are escaped via `escapeHtml()` prior to DOM insertion.
- **Zero-Secret Client Bundles:** Sensitive keys (`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`) are strictly confined to the backend server.

---

## Development & Build Workflows

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Express backend server. |
| `pnpm dev:web` | Starts the Next.js App Router development server with hot-reload. |
| `pnpm run build` | Compiles Next.js static pages and runs `export-to-site.mjs` to copy assets to `site/`. |
| `pnpm run parity` | Executes `check-parity.mjs` to verify DOM and text parity between legacy and exported pages. |
| `pnpm run db:migrate` | Applies SQL migration files to Supabase PostgreSQL. |
| `pnpm run db:seed` | Populates the database with initial marketplace data. |
| `pnpm run registry:generate`| Re-generates `site/registry.json` from published database templates. |

---

## Testing & Quality Assurance

Run the automated test suite:

```bash
pnpm test
```

Run specific test files:

```bash
# Admin API, security, CSRF, and user management tests
pnpm test test/admin-api.test.js

# Catalog automation and search relevance tests
pnpm test test/automation.test.js
```

---

## Deployment

### GitHub Pages (Static Marketplace)
The `site/` folder is pre-built and self-contained:
- GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) uploads `path: site`.
- Content-hashed Next.js chunks (`_next/`) ensure cache-invalidation.
- Directory aliases (`/admin/admins/index.html`) enable client-side routing on static hosts.

### Node.js / Container Deployment (Full Marketplace API)
Deploy the Express server to any Node.js container or cloud provider (e.g., Render, Railway, Fly.io, DigitalOcean):
```bash
# Set production environment
export NODE_ENV=production

# Start listener
pnpm start
```

---

## License

This project is licensed under the [MIT License](LICENSE).