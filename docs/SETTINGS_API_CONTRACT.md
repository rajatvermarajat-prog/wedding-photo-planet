# Settings workspace API contract

The Settings UI calls these authenticated, organization-scoped endpoints. Responses use the existing `{ success, data, meta }` envelope.

## Read workspace

`GET /settings/workspace` returns:

```ts
{
  viewer: { id, fullName, email, phone?, imageUrl?, isAdmin },
  organization?: { name, logoUrl?, contactEmail?, contactPhone?, timezone?, currency?, dateFormat? },
  notifications: Record<string, boolean>,
  security: { sessionTimeoutMinutes?, notifyNewLogin? },
  grantedModules: Array<{ key, label, description? }>,
  availableModules: Array<{ key, label, description? }>,
  requests: Array<{ id, employeeName, employeeEmail, moduleKey, moduleLabel, reason, status: 'PENDING' | 'APPROVED' | 'REJECTED', createdAt, reviewedAt?, reviewerName?, reviewReason? }>
}
```

## Mutations

- `PATCH /settings/profile` — `{ fullName, phone?, imageUrl? }`
- `PATCH /settings/organization` — organization fields above (admin only)
- `PATCH /settings/preferences` — `{ notifications?, security? }`
- `POST /settings/password` — `{ currentPassword, newPassword }`
- `POST /settings/module-access-requests` — `{ moduleKey, reason }`
- `PATCH /settings/module-access-requests/:id` — `{ status: 'APPROVED' | 'REJECTED', reviewReason? }` (admin only)

After a request review, invalidate the requester’s permission/session view or ensure `/auth/me` returns the updated module permissions on its next load. The frontend refreshes this workspace after each mutation and the sidebar already derives visibility from the live session permissions.
