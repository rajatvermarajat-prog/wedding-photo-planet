# Wedding Photo Planet CRM

A Next.js App Router frontend for Wedding Photo Planet's studio operations. It communicates with the production CRM backend over HTTP; it does not include backend source code or database access.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root URL redirects to `/dashboard`.

## Quality checks

```bash
npm run lint
npm run build
```

## Workspace routes

- `/dashboard`
- `/owner-workspace`
- `/workspaces`
- `/leads`
- `/projects`
- `/shoots`
- `/data-management`
- `/team`
- `/freelancers`
- `/deliveries`

Authentication is integrated with the standalone backend. The remaining CRM screens are being migrated from their legacy client-side data layer feature by feature; they must not be treated as backend-integrated until that work is complete.

## Architecture

```
Browser → Next.js frontend → NEXT_PUBLIC_API_URL → Express API → Prisma → PostgreSQL
```

The production backend is a separate repository at `../wedding-photo-planet-backend`. This frontend has no Prisma, Express server, or database connection code. Configure its public API URL with `NEXT_PUBLIC_API_URL`; never place database credentials or backend secrets in this repository.

## Frontend organization

The admin panel is organized by business feature rather than as one flat component directory. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the folder map and rules for adding future pages or components.
