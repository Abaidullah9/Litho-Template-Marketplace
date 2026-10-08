# Litho Template Marketplace

A curated marketplace for academic and technical document templates (theses, papers, reports, CVs). 

Includes a public catalog and an administrative dashboard backed by Supabase and Express.

---

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase project credentials and admin password:

```ini
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres?sslmode=require

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
ADMIN_SESSION_SECRET=random-32-char-secret-key

PORT=8787
HOST=0.0.0.0
```

### 3. Initialize Database

Run migrations to set up required tables and schema:

```bash
pnpm run db:migrate
```

*(Optional)* Seed sample templates:

```bash
pnpm run db:seed
```

### 4. Start the Application

```bash
node scripts/start.js
```

Open your browser:
- **Marketplace:** [http://localhost:8787](http://localhost:8787)
- **Admin Dashboard:** [http://localhost:8787/admin](http://localhost:8787/admin)

---

## Admin Dashboard

- Navigate to `http://localhost:8787/admin/login`
- Log in using `ADMIN_USERNAME` and `ADMIN_PASSWORD` from your `.env`
- Manage templates, review user submissions, manage categories/tags, and invite team administrators (`/admin/admins`).

---

## Deployment

### Deploy to Render (Full-Stack + Admin)

1. Connect your repository to [Render](https://render.com).
2. Create a **Web Service** using **Docker** runtime (uses the included `Dockerfile`).
3. Add your environment variables from `.env` (`SUPABASE_*`, `ADMIN_*`, `PORT=8787`).
4. Click **Deploy**. Your app and admin console will be live with full database and authentication support.

### Deploy to GitHub Pages (Static Catalog Only)

The static frontend is exported to `site/` and automatically deployed to GitHub Pages via GitHub Actions:
- Public catalog preview: `https://<username>.github.io/<repo>/`
- *Note:* GitHub Pages is purely static. The Admin login requires the live Node.js server (Render or localhost).

---

## Project Structure

```
├── server/          # Express 5 backend API & authentication
├── site/            # Static export served by Express & GitHub Pages
├── web/             # Next.js 16 source code (App Router)
├── supabase/        # Database migrations
└── scripts/         # Startup, migration, and catalog utilities
```

---

## Common Commands

| Command | Description |
| :--- | :--- |
| `node scripts/start.js` | Start the Express server and serve the marketplace |
| `pnpm run db:migrate` | Apply latest Supabase database migrations |
| `pnpm run db:seed` | Seed database with sample templates |
| `pnpm run build` | Rebuild Next.js app and update static export in `site/` |
| `pnpm test` | Run test suite |

---

## License

MIT