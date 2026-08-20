# Wedding Photo Planet CRM

A Next.js App Router frontend for Wedding Photo Planet's studio operations. The existing CRM UI, role-based workspaces, project workflows, modals, local persistence, reports, and freelancer tools are preserved while navigation is exposed through real routes.

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

Data is currently mock/local and persisted in the browser. Backend and authentication integration remain intentionally separate for the next implementation stage.

## Backend separation

The frontend has no runtime dependency on the backend package. The preserved backend code now lives independently in `services/backend/` with its own `package.json`, TypeScript config, environment file and setup documentation. Install or run it from that directory only when backend development begins.

## Frontend organization

The admin panel is organized by business feature rather than as one flat component directory. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the folder map and rules for adding future pages or components.
