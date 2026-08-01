---
name: accounting-app-module-standards
description: Project-level standards for creating or modifying frontend/react/app modules in the accounting app. Use when working on module pages, services, repositories, query keys, debug tags, SQL access, or flows similar to the account type module.
---

# Accounting App Module Standards

Use the account type module as the reference pattern for new modules and module changes.

## Module Structure

- Put screens in `app/<module>/list.tsx`, `create.tsx`, and `[id].tsx`.
- Put module-only UI in `app/<module>/_components`.
- Put form defaults, zod schemas, and form types in `forms/schemas`.
- Put business logic in `sql/service/<module>Service.ts`.
- Put SQL only in `sql/repo/<module>Repo.ts`.
- Put shared query keys in `constants/queryKeys.ts`.
- Put shared logging tags in `utils/debugLog.ts`.

Keep responsibilities separated: pages handle UI/forms/navigation/toasts, services handle business checks, repositories handle SQL/database access.

## Page Pattern

- Use TanStack Query hooks for database-backed state.
- Call service functions from pages, not repository functions.
- Use `AppToast` for user-facing success and validation messages.
- Track local loading state for create/update/delete actions.
- Disable actions while submitting.
- Normalize UI input in the page before calling the service when needed, such as `toTitleCase(value.label)`.
- Invalidate queries with `invalidateQuery(queryClient, key)`.

For list screens, follow the account type `useInfiniteQuery` pattern: `PAGE_SIZE = 40`, `initialPageParam: 1`, next page only when the last page length equals `PAGE_SIZE`, and map rows to `AppListCardItemType[]` inside `useMemo`.

For detail screens, load by `id` from `useLocalSearchParams`, enable the query only when `Boolean(id)`, reset the form from loaded data, invalidate list/detail after update, and invalidate list plus remove detail query after delete.

## Service Pattern

- Call repository functions.
- Own business checks such as duplicate label validation.
- Return a user-facing validation string when the page should display it.
- Throw unexpected errors upward.
- Do not use SQL, `AppToast`, `router`, or React state in services.

Example:

```ts
const existData = await getModuleByLabelFromDB(data.label);

if (existData) {
  debugLog(DEBUG_TAG.MODULE, "Duplicate label found when creating", {
    label: data.label,
    existingId: existData.id,
  });
  return "Same label found.";
}
```

## Repository Pattern

- Call `getDB()` inside each exported DB operation.
- Keep SQL in the repository file.
- Use typed DB calls such as `getAllAsync<T>` and `getFirstAsync<T>`.
- Filter soft-deleted rows with `deleted_at IS NULL`.
- Use `buildOrderBy(orderBy)` for configurable ordering.
- Use `randomUUID()` for new ids when matching the account type insert pattern.
- Set `sync_status = DB_SYNC_STATUS.PENDING` for update/delete writes that need sync.
- Catch repository errors, log with the DB tag, then rethrow.

Example:

```ts
console.error(DEBUG_TAG.MODULE_DB, "Error when getting module item by id", e);
throw e;
```

## Schema Pattern

- Define SQLite table creation in `sql/db/schemas.ts`.
- For soft-deletable labels/names, do not put `UNIQUE` directly on the column.
- Use a partial unique index so only active rows must be unique:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_module_active_label
  ON module_table(label)
  WHERE deleted_at IS NULL;
```

- Keep service duplicate checks aligned with the schema. If uniqueness only applies to active rows, lookup by label/name with `deleted_at IS NULL`.
- Keep `label`/name text columns `COLLATE NOCASE` when duplicates should be case-insensitive.

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

## Change Style

- Prefer narrow changes that match existing module code.
- Add shared helpers only when the same pattern is repeated.
- Reuse existing components such as `AppView`, `AppButton`, `AppTextInput`, `AppToast`, and module `_components`.
- Keep comments rare; add them only when the code is not self-explanatory.
