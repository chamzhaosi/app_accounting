---
name: accounting-app-module-structure
description: Project standards for module layout and responsibility boundaries under frontend/react/app. Use for new modules or when moving code between pages, components, forms, services, repos, query keys, and debug tags.
---

# Module Structure

Use the account type module as the reference pattern for new modules and module changes.

- Put screens in `app/<module>/list.tsx`, `create.tsx`, and `[id].tsx`.
- Put module-only UI in `app/<module>/_components`.
- Put form defaults, zod schemas, and form types in `forms/schemas`.
- Put business logic in `sql/service/<module>Service.ts`.
- Put SQL only in `sql/repo/<module>Repo.ts`.
- Put shared query keys in `constants/queryKeys.ts`.
- Put shared logging tags in `utils/debugLog.ts`.

Keep responsibilities separated:

- Pages handle UI, forms, navigation, toasts, and query invalidation.
- Services handle business checks and call repositories.
- Repositories handle SQL and database access.
