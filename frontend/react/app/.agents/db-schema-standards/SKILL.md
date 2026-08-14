---
name: accounting-app-db-schema-standards
description: Project standards for SQLite schema definitions under frontend/react/app/sql/db. Use when adding or changing tables, indexes, soft-delete uniqueness, or text collation.
---

# DB Schema Standards

- Define SQLite table creation in `sql/db/schemas.ts`.
- For soft-deletable labels or names, do not put `UNIQUE` directly on the column.
- Use a partial unique index so only active rows must be unique:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_module_active_label
  ON module_table(label)
  WHERE deleted_at IS NULL;
```

- Keep service duplicate checks aligned with the schema.
- If uniqueness only applies to active rows, lookup by label or name with `deleted_at IS NULL`.
- Keep `label` and name text columns `COLLATE NOCASE` when duplicates should be case-insensitive.
