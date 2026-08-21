---
name: accounting-app-component-controller-standards
description: Project standards for separating React Native presentation from controller hooks and placing reusable helpers under frontend/react/app. Use when creating or refactoring screens, dashboard cards, feature components, or hooks.
---

# Component And Controller Standards

Follow the repository's existing screen-plus-hook pattern.

## Presentation

- Keep screens and `_components` focused on rendering, layout, theme styling, accessibility, navigation, and user event wiring.
- Consume controller state through a feature hook under `hook/<feature>`.
- Keep small markup-only subcomponents beside their parent when they are not reused.
- Do not call repositories from UI code.

## Controller hooks

- Put TanStack Query calls, query error logging, local interaction state, memoized data transformation, and derived view state in `hook/<feature>/use<Name>.ts`.
- Return presentation-ready values and callbacks instead of exposing unrelated implementation details.
- When multiple controllers use the same query configuration and error handling, extract a focused shared hook rather than duplicating it.
- Keep navigation and user-facing toasts in the screen unless an existing module pattern places them elsewhere.

## Shared helpers

- Reuse formatters from `utils/number.ts`, date helpers from `utils/date.ts`, and text helpers from `utils/text.ts`.
- Before adding a local helper, search for an existing equivalent.
- Move a pure helper to `utils` when it has multiple consumers or is domain-independent. Keep feature-specific transformations private to the controller hook.
- Do not create a generic abstraction for logic that has only one clear feature owner.

## Data boundaries

- UI and controller hooks call services, never repositories.
- Services own business checks and repository coordination.
- Repositories own SQL and database access.
- Use the shared query keys and debug tags from their existing constants modules.

After refactoring, run TypeScript, Prettier, and `git diff --check`, and search the touched scope for the duplicate helper or query pattern that motivated the extraction.
