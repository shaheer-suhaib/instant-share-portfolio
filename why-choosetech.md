# Why We Chose These Technologies

Every tech decision in this project was made with one goal:
**ship fast, stay minimal, scale when needed, spend zero dollars at the start.**

---

## Table of Contents

1. [Cloudinary — File Storage](#1-cloudinary--file-storage)
2. [Render — Backend Hosting](#2-render--backend-hosting)
3. [PostgreSQL — Database](#3-postgresql--database)
4. [Node.js + Express — API Server](#4-nodejs--express--api-server)
5. [Why These 6 Tables — Database Design Explained](#5-why-these-6-tables--database-design-explained)
6. [Recommendations — What to Change as You Grow](#6-recommendations--what-to-change-as-you-grow)

---

## 1. Cloudinary — File Storage

### What it does here
Stores every user-uploaded file: profile photos, project screenshots, and resume PDFs.
When a user uploads a file, we stream it directly to Cloudinary and store only the URL in our database.

### Why we chose it

| Reason | Detail |
|--------|--------|
| **No server disk needed** | Render's free tier has an ephemeral filesystem — files disappear on every redeploy. Cloudinary bypasses this completely. |
| **Free tier is generous** | 25 GB storage + 25 GB bandwidth per month. Easily handles hundreds of portfolios for free. |
| **Auto image optimization** | One line of config gives you auto format (WebP on Chrome, JPEG on Safari), auto quality, and resizing. No extra code. |
| **CDN included** | Files are served from Cloudinary's global CDN — fast worldwide, no setup. |
| **No credit card to start** | Sign up and use immediately. |

### Pros

- Free tier lasts a long time for a new SaaS
- Built-in image transformations (resize, crop, quality) via URL params
- Works perfectly with Node.js via official SDK
- Handles both images (`resource_type: image`) and PDFs (`resource_type: raw`)
- Upload directly from server memory buffer — no temp files needed

### Cons

- **Vendor lock-in** — your file URLs are tied to Cloudinary's domain. Migrating to S3 later means re-uploading everything and updating all URLs in the DB.
- **Free tier has limits** — 25 credits/month. Each transformation costs credits. If you add many image transformations, you burn credits faster.
- **Not self-hostable** — you cannot run Cloudinary yourself. You depend on their uptime.
- **API secret must be kept safe** — if leaked, anyone can upload to your account.

### Alternatives considered

| Alternative | Why we did not choose it |
|-------------|-------------------------|
| **AWS S3** | Requires AWS account setup, IAM roles, bucket policies — too much configuration for MVP. Also not truly free (pay per request + storage). |
| **Supabase Storage** | Good option, but adds another vendor and the free tier is smaller (1 GB). |
| **Local disk (Render)** | Files are wiped on every redeploy on Render's free tier. Not viable. |

---

## 2. Render — Backend Hosting

### What it does here
Hosts the Node.js + Express API server and the PostgreSQL database.

### Why we chose it

| Reason | Detail |
|--------|--------|
| **Free tier exists** | Both Web Service and PostgreSQL are free to start. |
| **Zero DevOps** | Push to GitHub → auto deploy. No servers to manage, no Docker required. |
| **Managed PostgreSQL** | One click to create a database. No configuration needed. |
| **Internal networking** | The Web Service and PostgreSQL communicate over Render's internal network — fast and secure, no extra cost. |
| **Simple environment variables** | Set them in the dashboard — no secrets management setup needed. |

### Pros

- Fastest path from code to live URL
- Auto-deploys on every GitHub push
- HTTPS included by default (free SSL cert)
- Shell access to the running container (useful for `npm run db:init`)
- Scales vertically with a plan upgrade — no migration needed

### Cons

- **Free Web Service spins down after 15 min of inactivity** — first request takes 30–50 seconds to wake up. This is the biggest pain point for production use.
- **Free PostgreSQL expires after 90 days** — Render deletes the database. You must manually recreate it or upgrade to paid.
- **Free tier = 512 MB RAM, 0.1 CPU** — fine for a small SaaS, not for high traffic.
- **No background workers on free tier** — cannot run scheduled jobs (e.g. cleanup tasks) without upgrading.
- **Region limited** — fewer regions than AWS or GCP.

### Cost to go production-ready

| Service | Free | Paid |
|---------|------|------|
| Web Service | Free (sleeps) | $7/month (always on) |
| PostgreSQL | Free (90 days) | $7/month (persistent) |
| **Total** | $0 | **$14/month** |

### Alternatives considered

| Alternative | Why we did not choose it |
|-------------|-------------------------|
| **Railway** | Similar to Render, slightly easier DB setup, but free tier is $5 credit/month only — runs out quickly. |
| **Fly.io** | More powerful free tier, but requires Docker knowledge and CLI setup. Too much friction for MVP. |
| **Heroku** | Removed free tier in 2022. Cheapest plan is $5+/month with no persistent storage on entry plans. |
| **AWS / GCP / Azure** | Overkill for MVP. High complexity, steep learning curve, easy to misconfigure and get a surprise bill. |
| **VPS (DigitalOcean, Hetzner)** | Cheapest per compute, but requires manual server setup, Nginx config, SSL certs, process management (PM2). Not minimal. |

---

## 3. PostgreSQL — Database

### What it does here
Stores all portfolio data in a structured relational format across 6 tables.

### Why we chose it over MongoDB

This is the most important decision. Here is the honest comparison:

| Factor | PostgreSQL (chosen) | MongoDB |
|--------|--------------------|---------|
| **Data structure** | Relational — perfect for portfolios that have skills, projects, services all linked | Document — would store everything as one big JSON blob per portfolio |
| **Data integrity** | Foreign key constraints prevent orphaned data (e.g. a project without a portfolio) | No constraints by default — easy to end up with inconsistent data |
| **Cascade delete** | `ON DELETE CASCADE` — delete one portfolio, everything disappears cleanly | Must manually delete related documents |
| **Queries** | SQL — powerful joins, aggregations, filtering | MQL — good but less powerful for relational data |
| **Free hosting on Render** | Yes, first-class support | MongoDB Atlas has a free tier, but not on Render directly |
| **JSON support** | `JSONB` column type — can store flexible data AND query it | Native JSON — flexible |
| **Transactions** | Full ACID transactions — portfolio creation is all-or-nothing | Limited multi-document transactions |

### Why our data is relational (not document-based)

A portfolio is not a flat document. It has:

```
One portfolio → Many projects
One project   → Many images
One portfolio → Many skills
One portfolio → Many services
One portfolio → Many social links
```

With MongoDB, you would store all of this as one giant nested document.
That causes problems:

- **No ordering guarantee** on nested arrays without extra logic
- **No referential integrity** — images can reference deleted projects
- **Difficult to query** — "find all portfolios that have a React skill" requires complex aggregation
- **Document size limit** — MongoDB has a 16 MB per-document limit. Not an issue now, but means you cannot grow without restructuring.

With PostgreSQL and separate tables:
- Each relationship is enforced by the database, not by your code
- `display_order` on every table gives clean ordering control
- Parallel queries with `Promise.all` fetch all child data efficiently
- Adding a new field (e.g. `experience` table) is a new table + FK — clean, no existing data touched

### Pros

- ACID compliant — transactions guarantee all-or-nothing portfolio creation
- `ON DELETE CASCADE` handles cleanup automatically
- `JSONB` available if you need flexible fields later
- `TEXT[]` array type stores tech stacks without a join table
- Industry standard — easier to hire for, more documentation
- Render provides managed PostgreSQL — no setup needed

### Cons

- **Schema migrations** — adding or changing columns requires `ALTER TABLE`. With MongoDB you just add a field.
- **More tables to manage** — 6 tables vs 1 collection feels like more work upfront
- **Render free DB expires in 90 days** — must pay $7/month or recreate
- **Vertical scaling only** — PostgreSQL does not scale horizontally as easily as MongoDB for very high write loads

---

## 4. Node.js + Express — API Server

### Why we chose it

| Reason | Detail |
|--------|--------|
| **JavaScript everywhere** | Frontend (Next.js) and backend use the same language. No context switching. |
| **Minimal boilerplate** | Express is ~5 lines to get a server running. Perfect for MVP. |
| **Huge ecosystem** | `pg`, `cloudinary`, `multer`, `helmet`, `cors` — every package you need exists and is maintained. |
| **Async/await native** | Node.js handles I/O-heavy workloads (DB queries, file uploads) very efficiently. |
| **Render support** | First-class Node.js support on Render. Just `node server.js`. |

### Pros
- Fast to build, easy to read
- `pg` library gives full control over queries (no ORM magic hiding bugs)
- No transpilation needed — plain CommonJS runs directly

### Cons
- **No type safety** — plain JavaScript means bugs only show at runtime. Consider TypeScript if the team grows.
- **Express is unopinionated** — you have to structure the project yourself (which we did with controllers/routes/middleware)
- **Single-threaded** — CPU-heavy tasks block the event loop. Not an issue for this SaaS (we are I/O bound, not CPU bound).

### Alternatives considered

| Alternative | Why we did not choose it |
|-------------|-------------------------|
| **Fastify** | Faster than Express, but smaller community and less familiar to most developers. Express is safer for a team. |
| **NestJS** | Great for large teams, but heavy boilerplate for a minimal backend. Overkill. |
| **Hono** | Excellent lightweight option, but very new. Less documentation, fewer examples. |
| **Django / FastAPI (Python)** | Different language from the frontend. Fine technically, but adds context switching. |

---

## 5. Why These 6 Tables — Database Design Explained

### Table decisions

#### `portfolios` — the root table
Every other table points to this one. It holds the core identity of a portfolio:
name, bio, contact, template choice, the shareable code, and metadata (views, is_active, timestamps).

The `code` column is the public-facing identifier. We use an 8-character hex code (4 billion combinations)
instead of exposing internal UUIDs in URLs. This is a common SaaS pattern (Notion, Linear, etc.).

`is_active` is a soft-delete flag. We never hard-delete a portfolio — we just hide it.
This protects against accidental deletions and allows recovery.

`views` is an integer counter incremented atomically with every GET request.
Useful for the user to see how many people have viewed their portfolio.

---

#### `projects` — separate table, not an array in `portfolios`
We could have stored projects as a `JSONB` array inside `portfolios`.
We chose a separate table because:
- Projects need their own images (another table pointing to projects)
- `display_order` gives clean control over ordering
- Easier to query, index, and update individual projects without rewriting the full array
- `tech_stack TEXT[]` is a PostgreSQL array — stores `["React", "Node.js"]` natively without a join table

---

#### `project_images` — separate table, not an array in `projects`
Each project can have multiple images with ordering and a thumbnail flag.
A JSONB array inside `projects` would work, but:
- Cannot index individual images
- Cannot enforce that `url` is always present
- Cannot cascade-delete images independently

The `is_thumbnail` boolean lets the frontend pick the cover image without extra logic.

---

#### `skills` — separate table, not JSONB
Skills have three attributes: name, level, category. If stored as JSONB, querying
"all portfolios with expert-level React" would require a complex JSONB operator query.
As a table, it is a simple `WHERE name = 'React' AND level = 'expert'` — useful for future analytics.

`level` has a `CHECK` constraint enforcing only: `beginner`, `intermediate`, `advanced`, `expert`.
This prevents inconsistent data like `"pro"` or `"mid-level"` sneaking into the database.

---

#### `services` — separate table for the same reasons as skills
Services have optional `price_range`. A user might have 0 services or 10.
Separate table keeps the `portfolios` row clean and small.

---

#### `social_links` — separate table, not a JSONB object
We could store social links as `{ "github": "url", "linkedin": "url" }` in a JSONB column.
We chose a separate table because:
- Easy to add any platform without changing schema
- Platform name is validated as a string — no risk of mismatched keys
- Simple to query: `SELECT * FROM social_links WHERE platform = 'github'`

---

### Why `display_order` on every child table

The frontend needs to render items in a consistent order.
Database row order is not guaranteed in SQL — `SELECT *` can return rows in any order.
`display_order` is a `SMALLINT` (2 bytes, range -32768 to 32767) that we set to the array index
at insert time. This ensures items always render in the order the user provided them.

---

### Why `UUID` as primary key instead of `SERIAL` (integer)

| | UUID | SERIAL integer |
|--|------|---------------|
| **Predictability** | Not guessable | Sequential — easy to enumerate |
| **Distributed safe** | Can generate offline, no collision | Requires DB to generate |
| **URL safety** | We use `code` for URLs, not `id` | Would be dangerous to expose |
| **Size** | 16 bytes | 4 bytes |

Internal UUIDs are never exposed in our API responses that matter.
The `code` column (8-char hex) is what users share.

---

## 6. Recommendations — What to Change as You Grow

These are things that are fine now but you should change at specific growth milestones.

---

### When you get your first real users

| Change | Why |
|--------|-----|
| **Upgrade Render PostgreSQL to $7/month** | Free tier expires in 90 days. Do not lose user data. |
| **Upgrade Render Web Service to $7/month** | Eliminates the 30–50 second cold start. Users will not wait. |
| **Set `FRONTEND_URL` to your actual Vercel URL** | Currently `*` allows any origin. Lock it down to your domain. |

---

### When you want users to edit their own portfolios securely

Right now, anyone who knows a portfolio code can update or delete it.
Add a simple **edit token** system:

```
portfolios
  + edit_token  VARCHAR(32) UNIQUE   ← returned only at creation, never on GET
```

On create → return both `code` (for sharing) and `edit_token` (for editing).
PUT and DELETE require `edit_token` in the request header.
This requires zero auth infrastructure — just a secret string check.

---

### When you want proper user accounts

Add a `users` table and link portfolios to users:

```
users
  id, email, password_hash, created_at

portfolios
  + user_id UUID FK → users(id)
```

Use **JWT** (jsonwebtoken package) for session tokens.
At that point, switch PUT/DELETE to require a valid JWT instead of edit_token.

---

### When Cloudinary free tier runs out

Migrate to **Backblaze B2** + **Cloudflare R2**:
- Backblaze B2: $0.006/GB storage (10x cheaper than S3)
- Cloudflare R2: free egress (you pay only storage, not bandwidth)
- Combined: effectively free for small-to-medium traffic

Migration means: update `upload.controller.js` to point to the new SDK.
URLs stored in the DB will still work (Cloudinary keeps old files).
New uploads go to the new provider.

---

### When PostgreSQL becomes a bottleneck

At very high read traffic (thousands of concurrent portfolio views):

1. **Add Redis caching** — cache `GET /api/portfolio/:code` responses for 5 minutes.
   A portfolio does not change every second. Redis prevents hammering the DB on viral portfolios.

   ```
   GET /api/portfolio/:code
     → check Redis cache first
     → if hit: return cached response (< 1ms)
     → if miss: query PostgreSQL, store in Redis for 5 min, return response
   ```

2. **Read replicas** — Render and most cloud providers allow adding PostgreSQL read replicas.
   Writes go to primary, reads go to replica. Doubles your read capacity.

---

### When you want analytics

The `views` counter is already in the database. To go further, add:

```sql
CREATE TABLE portfolio_views (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID        NOT NULL REFERENCES portfolios(id),
  viewed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  country      VARCHAR(10),   -- from IP geolocation
  referrer     TEXT           -- from Referer header
);
```

This lets you show the user: views per day, where viewers come from, which referrers bring traffic.

---

### Technology you should NOT change unless there is a clear reason

| Technology | Why to keep it |
|------------|----------------|
| **PostgreSQL** | Relational data fits this project perfectly. No reason to switch. |
| **Express** | Simple, stable, well-documented. Only switch if the team grows and needs TypeScript + structure (then NestJS). |
| **Node.js** | I/O-bound workload — Node is the right tool. |
| **Cloudinary** | Only switch if you exceed the free tier and want to cut costs. |

---

## Summary

| Technology | Cost | Why chosen | When to reconsider |
|-----------|------|-----------|-------------------|
| Cloudinary | Free (25 GB) | No disk dependency, CDN, auto image optimization | When free tier runs out → Backblaze B2 + R2 |
| Render Web Service | Free (sleeps) / $7 paid | Zero DevOps, auto deploy from GitHub | Never — or migrate to Fly.io for more compute |
| Render PostgreSQL | Free (90 days) / $7 paid | Managed, same platform as API | Never — PostgreSQL is the right DB for this data |
| Node.js + Express | Free | Fast to build, same language as frontend | Add TypeScript when team grows |
| PostgreSQL | Free | Relational data, ACID, CASCADE | Never for this use case |
| 6-table schema | — | Clean separation, referential integrity | Add tables as features grow (never restructure existing ones) |
