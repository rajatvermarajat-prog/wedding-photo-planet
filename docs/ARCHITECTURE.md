# Frontend Architecture

The admin frontend uses feature-based organization. Route files remain small, reusable global UI stays in `components`, and each business domain owns its components beneath `features`.

```text
src/
├── app/                              # Next.js App Router and global theme
│   ├── [workspace]/page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── app/                          # Client bootstrap and CRM shell
│   │   ├── CrmApplication.tsx
│   │   └── CrmClient.tsx
│   ├── ai/                           # Shared AI experience
│   ├── auth/                         # Login and account switching
│   ├── common/                       # Cross-feature UI primitives/dialogs
│   └── layout/                       # Sidebar and top header
├── features/
│   ├── dashboard/components/
│   ├── owner/components/
│   ├── leads/components/
│   ├── projects/components/          # list, form, detail, invoice, payments, crew
│   ├── shoots/components/
│   ├── data-management/components/
│   ├── team/components/              # attendance, reports, member dashboard
│   ├── workspaces/components/        # role and social-media workspaces
│   ├── freelancers/components/
│   └── deliveries/components/
├── data/                             # Mock data adapters
├── types/                            # Shared domain contracts
└── utils/                            # Shared pure utilities
```

## Feature boundaries

- A feature keeps its page sections, forms, tables and feature-specific modals in its own `components` directory.
- Each feature exports its public API through `features/<feature>/index.ts`.
- The application shell imports feature barrels, not internal component paths.
- Shared UI belongs in `components/common`; layout and authentication do not belong inside a business feature.
- Shared entity contracts belong in `types`; reusable calculation-only code belongs in `utils`.
- New components should use the centralized theme documented in `DESIGN_SYSTEM.md`.

This boundary makes it safe to split the current large feature components into smaller sections incrementally without changing routes or application behavior.
