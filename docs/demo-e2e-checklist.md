# Homework Manager — End-to-End Demo Checklist

Repeatable manual script for demos, grading, or regression checks. Target runtime: **under 10 minutes**.

**Related docs:** [README](../README.md) (setup), [test.sh](../test.sh) (automated API smoke test), [RCA-api-homework-users-500.md](RCA-api-homework-users-500.md) (frontend-only failures).

Use two terminals: **Terminal A** (backend/Docker) and **Terminal B** (frontend).

---

## 1. Prerequisites

- [ ] Docker Desktop (or Docker daemon) is running
- [ ] Node.js 18+ and npm installed (`node -v`, `npm -v`)
- [ ] Repo cloned; shell at project root (`HomeworkManager/`)
- [ ] Ports **8080** (gateway) and **5173** (Vite) are free

---

## 2. Backend startup

**Terminal A:**

```bash
docker compose up -d --build
```

Wait until containers are healthy (~30–60 s on first build).

- [ ] Gateway health returns plain text `ok`:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health
# Expected: 200
curl http://localhost:8080/api/health
# Expected body: ok
```

- [ ] Service health endpoints return JSON with `"status":"healthy"`:

```bash
curl -s http://localhost:8080/api/homework/health | grep healthy
curl -s http://localhost:8080/api/users/health | grep healthy
curl -s http://localhost:8080/api/notifications/health | grep healthy
# Expected: each command prints a matching line (HTTP 200)
```

> **Note:** If you recently recreated hw-service containers and see intermittent API errors, run `docker compose restart nginx` (see [RCA-homework-submit-field-required.md](RCA-homework-submit-field-required.md)).

---

## 3. Seed user (fresh database)

Skip if user `1` already exists from a prior session.

```bash
curl -s -w "\nHTTP:%{http_code}\n" -X POST http://localhost:8080/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","grade_level":"11"}'
```

- [ ] `HTTP:201` and JSON body includes `"id":1` (or note the returned id)

Verify user:

```bash
curl -s -w "\nHTTP:%{http_code}\n" http://localhost:8080/api/users/1
```

- [ ] `HTTP:200` and JSON includes `"name":"Demo User"` (or your seeded name)

---

## 4. Frontend startup

**Terminal B:**

```bash
cd frontend
npm install    # first run only
npm run dev
```

- [ ] Vite reports `Local: http://localhost:5173/`
- [ ] Open http://localhost:5173 — page title **Homework Manager** loads
- [ ] UserBar shows **Showing homework for user 1**

---

## 5. List homework (happy path)

- [ ] Brief **Loading homework…** spinner, then either:
  - **Empty state:** “No assignments yet” + “Add your first assignment above.” (fresh DB), or
  - **Assignment cards** (if data already exists)
- [ ] No red list error and no `HTTP 500` in the browser

Optional API check:

```bash
curl -s -w "\nHTTP:%{http_code}\n" http://localhost:8080/api/homework/users/1/homework
```

- [ ] `HTTP:200` and JSON array (may be `[]`)

---

## 6. Add homework (UI)

1. Fill **Assignment name:** `Demo Checklist HW`
2. Fill **Course:** `CS426` (optional)
3. Pick a **Due date** in the future (any date/time tomorrow or later)
4. Click **Add assignment**

- [ ] Form clears on success
- [ ] New card appears in **Your assignments**
- [ ] Due date is human-readable (not raw ISO), e.g. `Due Jun 16, 2026, 2:30 PM`

Optional API check:

```bash
curl -s http://localhost:8080/api/homework/users/1/homework | grep "Demo Checklist HW"
```

- [ ] Command finds the new assignment name

---

## 7. Form validation (no API call)

| Step | Action | Expected |
|------|--------|----------|
| A | Clear assignment name, set future due date, submit | Inline error under name; **no** new list item |
| B | Enter `A` (1 char) as name, submit | “at least 2 characters” error |
| C | Valid name, set due date in the past, submit | “Due date must be in the future.” |

- [ ] All three checks pass (verify in DevTools Network: no `POST /api/homework/` on failed attempts)

---

## 8. Non-existent user (Task 3 error messaging)

1. In UserBar, enter user ID `999`
2. Click **Load**

- [ ] List shows error mentioning user not found and README seed command
- [ ] **Retry** button visible; page does not crash

Switch back to user `1` and click **Load** — list should recover.

- [ ] Homework for user 1 loads again

---

## 9. Error recovery (backend unavailable)

**Terminal A:**

```bash
docker compose stop
```

In the browser, reload http://localhost:5173 or click **Retry** on the list.

- [ ] List error mentions API gateway / Docker on port 8080
- [ ] **Retry** button is shown

**Terminal A** — restore backend:

```bash
docker compose start
# or: docker compose up -d
```

Wait ~10 s, then click **Retry** (or reload).

- [ ] List loads successfully again (HTTP 200 via UI)

---

## 10. Optional — automated smoke test

From project root (wipes volumes — use only when a clean slate is OK):

```bash
./test.sh
```

- [ ] Script ends with `Smoke test complete.` and all curls exit 0

---

## 11. Optional — notification side-effect

After creating homework via UI or curl:

```bash
curl -s -w "\nHTTP:%{http_code}\n" http://localhost:8080/api/notifications/1
```

- [ ] `HTTP:200` and JSON notification referencing the homework

---

## Quick reference — expected HTTP status codes

| Request | Expected | Failure indicator |
|---------|----------|-------------------|
| `GET /api/health` | 200, body `ok` | Connection refused |
| `GET /api/users/1` | 200 JSON user | 404 user missing |
| `GET /api/homework/users/1/homework` | 200 JSON array | 404 / 500 |
| `POST /api/homework/` (valid body) | 201 JSON homework | 422 validation |
| `POST /api/users/` (new email) | 201 JSON user | 502 / connection error |
| Frontend with backend stopped | List error + Retry | Blank or endless spinner |

---

## Done

All required sections (1–9) checked → demo-ready for presentation.
