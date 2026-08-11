# VitalMen — Backend & Admin

Monorepo for VitalMen API and admin panel.

| Project | Port | Stack |
|---------|------|-------|
| `menbackend` | **3001** | Express, Sequelize, PostgreSQL |
| `menadmin` | 3000 | Next.js 15, Tailwind, shadcn/ui |

## Demo admin login

After running seed:

| | |
|---|---|
| **Email** | `admin@vitalmen.mn` |
| **Password** | `VitalMen@2026` |

Demo app user: `demo@vitalmen.mn` / `password123`

## Quick start

### 1. PostgreSQL

Create database `men` and configure `menbackend/.env`:

```env
DB_NAME=men
DB_USER=postgres
DB_PASSWORD=postgres
```

### 2. Backend

```bash
cd menbackend
npm install
npm run seed    # creates tables + demo data
npm run dev     # http://localhost:3001
```

### 3. Admin panel

```bash
cd menadmin
npm install
npm run dev     # http://localhost:3000
```

## Admin modules (full app control)

| Module | Manage |
|--------|--------|
| Dashboard | Stats, quick links |
| Users | Membership, role, streak, delete |
| Sessions | Workout history from app |
| Workouts | Programs, exercises, today's workout |
| Articles | Learn content |
| Health bites | Daily tips |
| Assessment | Questions + user answers |
| Products | Shop catalog (matches Flutter app) |
| Orders | Shop orders, status workflow |
| Plans | Premium pricing |
| Payments | QPay invoice status |

## Architecture

- **Backend**: REST API at `/api/*` (Flutter app) and `/api/admin/*` (admin panel)
- **Admin**: Component-based — `ResourceManager`, `DynamicForm`, `DataTable`, resource configs in `lib/resource-configs/`
- **Flutter app**: `/Users/bayakaa/StudioProjects/men` — wire to `http://localhost:3001` when ready

## API overview

- `GET /health` — health check
- `GET /api/shop/products` — shop catalog
- `POST /api/shop/orders` — create order
- `GET /api/*` — Flutter app API
- `GET /api/admin/*` — admin CRUD (requires admin JWT)
