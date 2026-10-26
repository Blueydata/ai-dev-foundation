# API

Every route the application serves. Route handlers live in `src/app/`, parse input with zod (`parseJsonBody`), call a module through its `index.ts` and return JSON; errors follow the table in [architecture](architecture.md#error-handling).

## Pages

| Path | Access | URL parameters | Renders | Code |
| --- | --- | --- | --- | --- |
| `/` | Public | none | System status card | [`src/app/page.tsx`](../../src/app/page.tsx) |

## API routes

### `GET /api/health`

| Field | Content |
| --- | --- |
| Access | Public |
| Input | none |
| Output | `200` when the database is reachable, `503` when it is not, both with the `SystemStatus` body |
| Errors | none: an unreachable database is reported in the body |
| Used by | `docker-compose.yml` health check of the `app` service, CI (`docker compose up --wait`), `/setup-project`, `/test-in-browser` |
| Code | [`src/app/api/health/route.ts`](../../src/app/api/health/route.ts) → [`getSystemStatus`](modules/system-status.md) |

Responses:

```json
{ "app": "ok", "database": "ok" }
```

```json
{ "app": "ok", "database": "unavailable" }
```

Example:

```bash
curl -s -i http://localhost:3000/api/health
```

## Error body

Every route wrapped in `withErrorHandling` answers errors with the same shape:

```json
{ "error": { "code": "not_found", "message": "Order 8f3a not found" } }
```

Related: [architecture](architecture.md) · [security](security.md)
