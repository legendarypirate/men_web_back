# VitalMen Backend

Express + Sequelize + PostgreSQL API for the VitalMen Flutter app.

## Setup

```bash
cd menbackend
npm install
```

Create PostgreSQL database:

```sql
CREATE DATABASE men;
```

Copy `.env.example` to `.env` and adjust credentials.

## Run

```bash
# Seed database (creates tables + demo data)
npm run seed

# Start API on port 3001
npm run dev
```

## Credentials

- **Admin:** `admin@vitalmen.mn` / `admin123`
- **Demo user:** `demo@vitalmen.mn` / `password123`

## API

- Health: `GET http://localhost:3001/health`
- App API: `http://localhost:3001/api/*`
- Admin API: `http://localhost:3001/api/admin/*`
