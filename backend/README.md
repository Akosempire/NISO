# NISO Backend

Active backend for NISO is a Node.js/Express + MongoDB/Mongoose service.

## Active Runtime Source Of Truth

- Entrypoint: `src/server.js`
- Database connection: `src/db/connect.js`
- API routes: `src/routes/*.js`
- Data models: `src/models/*.js`
- Environment file: `.env`

The TypeScript files under `src/index.ts`, `src/config.ts`, and `src/services/*.ts`
belong to an older Prisma/PostgreSQL scaffold and are not the live runtime path.

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas or another reachable MongoDB deployment

## Environment

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-host>/?retryWrites=true&w=majority
DB_NAME=niso_db
JWT_SECRET=change-me
JWT_EXPIRES_IN=24h
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
```

## Run

```bash
cd backend
npm install
npm run dev
```

Production:

```bash
npm start
```

## Seed Demo Data

```bash
npm run seed
```

The seed script creates one demo account for each main role plus a station and
sample equipment.

## Health And Readiness

- `GET /health` returns process status plus Mongo connection state
- `GET /ready` returns `200` only when Mongo is connected and `503` otherwise

This is the preferred way to verify whether the backend is truly usable instead
of only checking whether the HTTP server is listening.

## API Surface

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET|POST|PATCH /api/readings`
- `GET|POST /api/sla`
- `GET|POST|PATCH /api/interruptions`
- `GET|POST|PATCH /api/inspections`
- `GET|POST /api/equipment`
- `GET|POST /api/reports`
- `GET|PATCH /api/notifications`
- `GET|PATCH /api/users`
- `GET|POST /api/approvals`
- `GET /api/knowledge`
- `GET|POST /api/month`

## Current Go-Live Blocker

The active blocker observed in this environment is MongoDB Atlas access. The
server can be listening while data-backed routes still fail if Atlas rejects the
current machine or the cluster is unreachable.

If login or list endpoints fail, verify:

1. The Atlas cluster is running
2. The current public IP is allowed in Atlas Network Access
3. The credentials in `.env` are still valid
4. The cluster hostname in `MONGODB_URI` is current

## Logging

Logs are written to:

- console
- `logs/error.log`
- `logs/combined.log`
