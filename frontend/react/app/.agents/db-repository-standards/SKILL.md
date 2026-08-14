---
name: accounting-app-db-repository-standards
description: Project standards for SQL repository code under frontend/react/app/sql/repo. Use when adding or changing database repository functions.
---

# DB Repository Standards

Repositories own SQL and database access.

- Call `getDB()` inside each exported DB operation.
- Keep SQL in the repository file.
- Use typed DB calls such as `getAllAsync<T>` and `getFirstAsync<T>`.
- Filter soft-deleted rows with `deleted_at IS NULL`.
- Use `buildOrderBy(orderBy)` for configurable ordering.
- Use `randomUUID()` for new ids when matching the account type insert pattern.
- Set `sync_status = DB_SYNC_STATUS.PENDING` for update and delete writes that need sync.
- Catch repository errors, log with the DB tag, then rethrow.

Example:

```ts
console.error(DEBUG_TAG.MODULE_DB, "Error when getting module item by id", e);
throw e;
```
