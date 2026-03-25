# Portfolio Share — Backend API

Minimal, scalable REST API for the instant portfolio share SaaS.
Built with **Node.js + Express**, **PostgreSQL** (Render), and **Cloudinary**.

---

## Architecture

```
┌──────────────────────────────┐
│      Vercel Frontend         │
│   (Next.js — yoursite.com)   │
└──────────────┬───────────────┘
               │  HTTPS REST
               ▼
┌──────────────────────────────┐
│      Render Backend          │
│   (Node.js + Express)        │
│                              │
│  POST /api/portfolio  ──┐    │
│  GET  /api/portfolio/:code   │
│  POST /api/upload/*   ──┐    │
└──────────────┬──────────┼────┘
               │          │
    ┌──────────▼──┐   ┌───▼──────────────┐
    │  PostgreSQL  │   │   Cloudinary     │
    │ (Render DB)  │   │ images + resumes │
    └─────────────┘   └──────────────────┘
```

---

## Database Design

**Why PostgreSQL (relational)?**
Portfolio data is structured and relational — a portfolio *has many* projects,
each project *has many* images, and so on. PostgreSQL gives us:
- Foreign key constraints (no orphaned data)
- `ON DELETE CASCADE` (delete portfolio → everything goes with it)
- `TEXT[]` arrays for tech stacks (no join needed)
- `json_agg` to return projects + images in one query

---

### Entity Relationship Diagram

```
portfolios
    │ id (PK)
    │ code            ← the shareable 8-char code
    │ template_id
    │ name, title, bio
    │ email, phone, location
    │ avatar_url, resume_url
    │ is_active, views
    │ created_at, updated_at
    │
    ├─────────────────────────────────────────────┐
    │                   │                │        │
    │ 1:N               │ 1:N            │ 1:N    │ 1:N
    ▼                   ▼                ▼        ▼
 projects            skills          services  social_links
    │ id (PK)           id (PK)         id (PK)   id (PK)
    │ portfolio_id(FK)  portfolio_id    portfolio  portfolio
    │ title             name            title      platform
    │ description       level           description url
    │ tech_stack[]      category        price_range
    │ live_url
    │ repo_url
    │ display_order
    │
    │ 1:N
    ▼
 project_images
    id (PK)
    project_id (FK)
    url
    is_thumbnail
    display_order
```

---

### Table: `portfolios`

| Column       | Type         | Constraints                          | Description                  |
|-------------|--------------|--------------------------------------|------------------------------|
| id          | UUID         | PK, DEFAULT gen_random_uuid()        | Internal unique identifier   |
| code        | VARCHAR(8)   | UNIQUE, NOT NULL                     | Public shareable URL code    |
| template_id | SMALLINT     | NOT NULL, CHECK (1 OR 2 OR 3)        | Chosen template number       |
| name        | VARCHAR(255) | NOT NULL                             | Full name                    |
| title       | VARCHAR(255) | nullable                             | Job title / tagline          |
| bio         | TEXT         | nullable                             | About me paragraph           |
| email       | VARCHAR(255) | nullable                             | Contact email                |
| phone       | VARCHAR(50)  | nullable                             | Contact phone                |
| location    | VARCHAR(255) | nullable                             | City, Country                |
| avatar_url  | TEXT         | nullable                             | Cloudinary profile photo URL |
| resume_url  | TEXT         | nullable                             | Cloudinary PDF resume URL    |
| is_active   | BOOLEAN      | NOT NULL, DEFAULT TRUE               | Soft-delete flag             |
| views       | INTEGER      | NOT NULL, DEFAULT 0                  | Total view count             |
| created_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()              | Record creation time         |
| updated_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()              | Auto-updated on every PUT    |

---

### Table: `projects`

| Column        | Type         | Constraints                        | Description                  |
|--------------|--------------|------------------------------------|------------------------------|
| id           | UUID         | PK, DEFAULT gen_random_uuid()      | Internal identifier          |
| portfolio_id | UUID         | FK → portfolios(id) CASCADE DELETE | Parent portfolio             |
| title        | VARCHAR(255) | NOT NULL                           | Project name                 |
| description  | TEXT         | nullable                           | What the project does        |
| tech_stack   | TEXT[]       | NOT NULL, DEFAULT '{}'             | e.g. ["React", "Node.js"]    |
| live_url     | TEXT         | nullable                           | Live demo link               |
| repo_url     | TEXT         | nullable                           | GitHub / GitLab link         |
| display_order| SMALLINT     | NOT NULL, DEFAULT 0                | Sort order on the portfolio  |

---

### Table: `project_images`

| Column        | Type     | Constraints                      | Description               |
|--------------|----------|----------------------------------|---------------------------|
| id           | UUID     | PK, DEFAULT gen_random_uuid()    | Internal identifier       |
| project_id   | UUID     | FK → projects(id) CASCADE DELETE | Parent project            |
| url          | TEXT     | NOT NULL                         | Cloudinary image URL      |
| is_thumbnail | BOOLEAN  | NOT NULL, DEFAULT FALSE          | Used as project cover     |
| display_order| SMALLINT | NOT NULL, DEFAULT 0              | Sort order in gallery     |

---

### Table: `skills`

| Column        | Type         | Constraints                                          | Description               |
|--------------|--------------|------------------------------------------------------|---------------------------|
| id           | UUID         | PK, DEFAULT gen_random_uuid()                        | Internal identifier       |
| portfolio_id | UUID         | FK → portfolios(id) CASCADE DELETE                   | Parent portfolio          |
| name         | VARCHAR(100) | NOT NULL                                             | Skill name e.g. "React"   |
| level        | VARCHAR(50)  | CHECK IN (beginner, intermediate, advanced, expert)  | Proficiency level         |
| category     | VARCHAR(100) | nullable                                             | e.g. "frontend", "tools"  |
| display_order| SMALLINT     | NOT NULL, DEFAULT 0                                  | Sort order                |

---

### Table: `services`

| Column        | Type         | Constraints                        | Description               |
|--------------|--------------|------------------------------------|---------------------------|
| id           | UUID         | PK, DEFAULT gen_random_uuid()      | Internal identifier       |
| portfolio_id | UUID         | FK → portfolios(id) CASCADE DELETE | Parent portfolio          |
| title        | VARCHAR(255) | NOT NULL                           | Service name              |
| description  | TEXT         | nullable                           | What is included          |
| price_range  | VARCHAR(100) | nullable                           | e.g. "$500–$2000"         |
| display_order| SMALLINT     | NOT NULL, DEFAULT 0                | Sort order                |

---

### Table: `social_links`

| Column        | Type        | Constraints                        | Description                    |
|--------------|-------------|------------------------------------|--------------------------------|
| id           | UUID        | PK, DEFAULT gen_random_uuid()      | Internal identifier            |
| portfolio_id | UUID        | FK → portfolios(id) CASCADE DELETE | Parent portfolio               |
| platform     | VARCHAR(50) | NOT NULL                           | e.g. "github", "linkedin"      |
| url          | TEXT        | NOT NULL                           | Full profile URL               |

---

### Indexes

| Index Name                  | Table          | Column       | Purpose                            |
|-----------------------------|---------------|--------------|-------------------------------------|
| idx_portfolios_code         | portfolios    | code         | Fast lookup by shareable code (PK of every GET) |
| idx_portfolios_active       | portfolios    | is_active    | Filter soft-deleted rows quickly    |
| idx_projects_portfolio      | projects      | portfolio_id | Fast join to parent portfolio       |
| idx_skills_portfolio        | skills        | portfolio_id | Fast join to parent portfolio       |
| idx_services_portfolio      | services      | portfolio_id | Fast join to parent portfolio       |
| idx_social_portfolio        | social_links  | portfolio_id | Fast join to parent portfolio       |

---

## API Reference

### Base URL
```
Local:      http://localhost:4000
Production: https://your-app.onrender.com
```

### Endpoints

| Method | Path                    | Auth | Description                        |
|--------|------------------------|------|------------------------------------|
| GET    | /health                | none | Server health check                |
| POST   | /api/upload/image      | none | Upload a project image             |
| POST   | /api/upload/resume     | none | Upload a PDF resume                |
| POST   | /api/portfolio         | none | Create portfolio → returns code    |
| GET    | /api/portfolio/:code   | none | Fetch full portfolio by code       |
| PUT    | /api/portfolio/:code   | none | Update a portfolio                 |
| DELETE | /api/portfolio/:code   | none | Soft-delete a portfolio            |

---

### Upload Flow (always do this first)

```
Step 1 — Upload files
  POST /api/upload/image   (form-data: field "image")
  → { success: true, url: "https://res.cloudinary.com/..." }

  POST /api/upload/resume  (form-data: field "resume")
  → { success: true, url: "https://res.cloudinary.com/..." }

Step 2 — Create portfolio (include the URLs from step 1)
  POST /api/portfolio
  → { success: true, code: "a1b2c3d4", url: "https://yoursite.com/p/a1b2c3d4" }
```

---

### POST /api/portfolio — Request Body

```json
{
  "template_id": 1,
  "name": "Jane Doe",
  "title": "Full Stack Developer",
  "bio": "I build things for the web.",
  "email": "jane@example.com",
  "phone": "+1 234 567 8900",
  "location": "New York, USA",
  "avatar_url": "https://res.cloudinary.com/your-cloud/image/upload/v1/.../photo.jpg",
  "resume_url": "https://res.cloudinary.com/your-cloud/raw/upload/v1/.../resume.pdf",

  "skills": [
    { "name": "React",    "level": "expert",        "category": "frontend" },
    { "name": "Node.js",  "level": "advanced",      "category": "backend"  },
    { "name": "Figma",    "level": "intermediate",  "category": "tools"    }
  ],

  "services": [
    {
      "title": "Web Development",
      "description": "Full-stack web applications",
      "price_range": "$500–$2000"
    }
  ],

  "social_links": [
    { "platform": "github",   "url": "https://github.com/janedoe"          },
    { "platform": "linkedin", "url": "https://linkedin.com/in/janedoe"      }
  ],

  "projects": [
    {
      "title": "My SaaS App",
      "description": "A subscription-based productivity tool.",
      "tech_stack": ["React", "Node.js", "PostgreSQL", "Stripe"],
      "live_url": "https://myapp.com",
      "repo_url": "https://github.com/janedoe/myapp",
      "images": [
        { "url": "https://res.cloudinary.com/.../cover.jpg", "is_thumbnail": true },
        { "url": "https://res.cloudinary.com/.../screen2.jpg" }
      ]
    }
  ]
}
```

### POST /api/portfolio — Response

```json
{
  "success": true,
  "code": "a1b2c3d4",
  "url": "https://your-app.vercel.app/p/a1b2c3d4"
}
```

---

### Rate Limits

| Endpoint              | Window  | Max Requests | Notes                  |
|-----------------------|---------|--------------|------------------------|
| All routes            | 15 min  | 100 / IP     | Global guard           |
| POST /api/portfolio   | 1 hour  | 10 / IP      | Prevents code spam     |
| POST /api/upload/*    | 15 min  | 30 / IP      | Prevents upload abuse  |

---

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                      ← PostgreSQL connection pool (pg)
│   │   └── cloudinary.js              ← Cloudinary config + multer memory storage
│   │
│   ├── controllers/
│   │   ├── portfolio.controller.js    ← create / read / update / delete logic
│   │   └── upload.controller.js      ← stream buffer → Cloudinary
│   │
│   ├── db/
│   │   └── schema.sql                 ← full DB schema — run once to initialise
│   │
│   ├── middleware/
│   │   ├── errorHandler.js            ← global error handler + 404
│   │   ├── rateLimit.js               ← global / create / upload limiters
│   │   └── validate.js                ← input validation for portfolio routes
│   │
│   ├── routes/
│   │   ├── portfolio.routes.js        ← CRUD routes for /api/portfolio
│   │   └── upload.routes.js           ← upload routes for /api/upload
│   │
│   └── app.js                         ← Express app (cors, helmet, routes)
│
├── server.js                          ← entry point — starts the server
├── package.json
├── .env.example                       ← copy to .env and fill in your values
└── README.md
```

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in DATABASE_URL, CLOUDINARY_*, FRONTEND_URL

# 3. Create tables (requires psql CLI and DATABASE_URL set)
npm run db:init

# 4. Start dev server
npm run dev
```

---

## Deploy to Render

1. Push repo to GitHub
2. On [render.com](https://render.com) → **New Web Service** → connect your repo
3. **Build command:** `npm install`
4. **Start command:** `node server.js`
5. Add env vars in the Render dashboard (see `.env.example`)
6. **New PostgreSQL** on Render → copy the **Internal Database URL** → paste as `DATABASE_URL`
7. After first deploy, open the Render shell and run: `npm run db:init`

---

## How the Shareable Code Works

```
User fills form on Vercel
        │
        ▼
POST /api/portfolio  →  backend generates 8-char hex code (e.g. "a1b2c3d4")
        │                stores all data in PostgreSQL
        ▼
Returns: { code: "a1b2c3d4", url: "https://yoursite.com/p/a1b2c3d4" }
        │
        ▼
User shares the link

Anyone visits yoursite.com/p/a1b2c3d4
        │
        ▼
Next.js reads code from URL params
        │
        ▼
GET /api/portfolio/a1b2c3d4  →  returns all portfolio data
        │
        ▼
Frontend renders with Template 1 / 2 / 3 (stored in data.template_id)
```

No login. No session. The code IS the access.
