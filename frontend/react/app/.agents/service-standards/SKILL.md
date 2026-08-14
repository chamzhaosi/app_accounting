---
name: accounting-app-service-standards
description: Project standards for service-layer business logic under frontend/react/app/sql/service. Use when adding or changing module services.
---

# Service Standards

Services own business checks and coordinate repository calls.

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
