---
name: accounting-app-agent-routing
description: Routing guide for project-level accounting app skills. Use before changing code under frontend/react/app, then read the specific skill files that match the task.
---

# Accounting App Agent Routing

Use the account type module as the reference pattern for new modules and module changes.

Before changing code under `frontend/react/app`, read the focused skill files that match the work:

- For new modules, module folder layout, or responsibility boundaries, use `module-structure/SKILL.md`.
- For screen, form, navigation, toast, or TanStack Query work, use `page-query-patterns/SKILL.md`.
- For service-layer business checks, use `service-standards/SKILL.md`.
- For SQL repository work, use `db-repository-standards/SKILL.md`.
- For SQLite schema or uniqueness work, use `db-schema-standards/SKILL.md`.
- For query keys or debug logging tags, use `query-key-and-logging-standards/SKILL.md`.
- For git commit, use `git-commit/SKILL.md`.

For full module creation or broad module refactors, read all focused skill files.

Prefer narrow changes that match existing module code. Add shared helpers only when the same pattern is repeated. Reuse existing components such as `AppView`, `AppButton`, `AppTextInput`, `AppToast`, and module `_components`. Keep comments rare; add them only when the code is not self-explanatory.
