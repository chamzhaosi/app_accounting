---
name: accounting-app-query-key-and-logging-standards
description: Project standards for query keys, query invalidation, and debug logging tags under frontend/react/app.
---

# Query Keys And Logging

## Query Keys

Define module query keys in `constants/queryKeys.ts` using the account type shape:

```ts
export const moduleQueryKeys = {
  all: [QueryKeyModule.MODULE] as const,
  lists: () => [...moduleQueryKeys.all, "list"] as const,
  list: (params: { pageSize: number }) =>
    [...moduleQueryKeys.lists(), params] as const,
  details: () => [...moduleQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...moduleQueryKeys.details(), id] as const,
};
```

Use:

```ts
await invalidateQuery(queryClient, moduleQueryKeys.lists());
```

Avoid repeating `queryClient.invalidateQueries({ queryKey })`.

## Logging

Add reusable tags in `utils/debugLog.ts`:

```ts
MODULE = "[Module]",
MODULE_DB = "[Module:DB]",
```

Rules:

- `debugLog(...)` receives the relevant `DEBUG_TAG` as the first argument.
- Module `console.error(...)` receives the relevant `DEBUG_TAG` as the first argument.
- Use the normal module tag in pages and services.
- Use the DB tag in repositories.
- Keep log messages short and searchable.
- Include useful payloads such as `id`, `label`, `count`, `found`, or `reason`.
