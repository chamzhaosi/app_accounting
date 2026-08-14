---
name: accounting-app-page-query-patterns
description: Project standards for React module screens, forms, navigation, toasts, loading state, and TanStack Query usage under frontend/react/app.
---

# Page And Query Patterns

Use the account type module as the reference pattern for module pages.

- Use TanStack Query hooks for database-backed state.
- Call service functions from pages, not repository functions.
- Use `AppToast` for user-facing success and validation messages.
- Track local loading state for create, update, and delete actions.
- Disable actions while submitting.
- Normalize UI input in the page before calling the service when needed, such as `toTitleCase(value.label)`.
- Invalidate queries with `invalidateQuery(queryClient, key)`.

For list screens, follow the account type `useInfiniteQuery` pattern:

- Set `PAGE_SIZE = 40`.
- Set `initialPageParam: 1`.
- Load the next page only when the last page length equals `PAGE_SIZE`.
- Map rows to `AppListCardItemType[]` inside `useMemo`.

For detail screens:

- Load by `id` from `useLocalSearchParams`.
- Enable the query only when `Boolean(id)`.
- Reset the form from loaded data.
- After update, invalidate list and detail queries.
- After delete, invalidate list queries and remove the detail query.
