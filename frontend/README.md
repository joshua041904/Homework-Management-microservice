# Homework Manager Frontend

React + Vite client for the Homework Manager microservices backend.

## Setup

See the **Full Local Demo** section in the [root README](../README.md). Summary:

1. Start the backend: `docker compose up -d --build` (from repo root)
2. Seed user 1 if needed (see root README)
3. Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:5173. API requests go to `/api`, which Vite proxies to `http://localhost:8080`.

The backend must be running before starting the frontend. Otherwise API calls fail with HTTP 500 (proxy connection refused).
