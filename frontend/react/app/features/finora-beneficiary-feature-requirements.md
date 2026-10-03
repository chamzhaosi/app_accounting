# Finora Beneficiary Feature Requirements

## 1. Purpose

Add a **Beneficiary** feature to Finora so users can record who an expense is for.

Examples:

- Toys for Son
- Bills for Parents House
- Lunch for Me
- Household expenses for Family

The feature must integrate with:

- Settings
- Expense transactions
- Missing-expense balance corrections
- Transaction listings
- Budget category allocations
- Budget filtering
- Category detail filtering
- Existing budget copy-forward behavior

The implementation should preserve Finora's current UI patterns and reuse the existing architecture wherever possible.

---

## 2. Implementation Approach

Before changing code, inspect the current Finora codebase and understand the existing implementation for:

- Transaction forms
- Transaction list rendering
- Category selector
- Account selector
- Budget creation/editing
- Budget category allocations
- Budget copy-forward logic
- Budget progress calculations
- Category detail page
- Existing database migrations
- Existing repository/service/hooks/state patterns
- Existing icon constants and Lucide icon usage
- Existing form validation
- Existing navigation/state preservation patterns
- Existing i18n structure

### Important

Do **not** create a parallel implementation if an existing reusable component, calculation, hook, service, repository, or layout pattern already exists.

Existing Finora behavior is the source of truth unless this requirement explicitly changes it.

---

# 3. Terminology

## 3.1 Beneficiary

A beneficiary represents the target of an expense.

There are two beneficiary types:

- `INDIVIDUAL`
- `GROUP`

A transaction may reference **exactly one beneficiary** when beneficiary support applies.

---

## 3.2 Individual

A single person.

Examples:

- Me
- Son
- Wife
- Father
- Friend

---

## 3.3 Group

A logical target made from one or more existing Individuals.

Examples:

- Parents
- Parents House
- Family

A Group is also a standalone beneficiary.

A transaction assigned to a Group must **not** automatically count toward the Individuals inside that Group.

Example:

- Group: Parents
- Members: Father, Mother
- Expense: RM100, For = Parents

This expense belongs to `Parents`, not RM100 to Father and RM100 to Mother.

---

# 4. V1 Scope

## 4.1 Supported

Beneficiary applies to:

- Expense transactions
- Missing Expense balance corrections
- Budget beneficiary allocations
- Budget beneficiary filters
- Category detail beneficiary filters
- Transaction list display

## 4.2 Not Supported in V1

Beneficiary does **not** apply to:

- Income transactions
- Transfer transactions
- Normal accounting Correction transactions

Do not add a `From` / payer feature for income in this version.

---

# 5. Core Business Rules

## 5.1 One Transaction = One Beneficiary

A transaction must never support multiple beneficiaries in V1.

Allowed:

- Expense -> Me
- Expense -> Son
- Expense -> Parents House

Not allowed:

- Expense -> Son + Wife
- Expense -> Me + Parents House

This restriction is intentional because multiple beneficiaries would make budget and reporting calculations ambiguous.

---

## 5.2 Beneficiary Mandatory for Expense

For all new Expense transactions:

- Beneficiary is mandatory.
- Default beneficiary is the built-in self beneficiary.
- The user may change it to another active Individual or active Group.
- The beneficiary cannot be cleared.

For Missing Expense:

- Beneficiary is also mandatory.
- Default beneficiary is the built-in self beneficiary.

---

# 6. Built-in Self Beneficiary

Create exactly one built-in self beneficiary when the beneficiary feature is initialized.

Default display values:

- Name: `Me`
- Relationship: `Self`
- Active: `true`
- Internal flag: `isSelf = true`

The exact database field naming should follow the existing codebase naming convention.

## 6.1 Self Rules

The self beneficiary:

- must always remain active
- cannot be deactivated
- cannot be deleted
- may have editable name
- may have editable icon
- may have editable relationship
- may have editable description
- must remain internally identifiable even if renamed

Do not identify the self beneficiary using:

```ts
name === "Me"
```

Use an internal flag or equivalent persistent identifier.

There must never be more than one self beneficiary.

---

# 7. Progressive Disclosure

If the self beneficiary is the **only active beneficiary**, beneficiary-related UI should stay hidden because selecting `Me` would provide no value.

## 7.1 When Only Me Exists

Hide:

- `For` field in Expense form
- `For` field in Missing Expense form
- Beneficiary filter in Budget
- Beneficiary allocation controls in Budget
- Beneficiary filter in Category Detail

At the data level:

- Expense still saves the self beneficiary automatically.
- Missing Expense still saves the self beneficiary automatically.

Budget should behave like the current category budget implementation without forcing users to configure a redundant `Me` allocation.

## 7.2 When Another Active Beneficiary Exists

Once at least one other active Individual or Group exists:

Show:

- `For` field
- Beneficiary budget allocation functionality
- Beneficiary filters

## 7.3 If All Non-self Beneficiaries Become Inactive

Return to the hidden/simple UI for new/current data.

Historical periods containing previous beneficiary data must still remain viewable and filterable where applicable.

---

# 8. Beneficiary Management

Add a new Settings entry:

`Beneficiary Management`

The management page must contain two main tabs:

```text
[ Individual ] [ Group ]
```

Each tab has its own floating Add button.

Behavior:

- Individual tab + Add -> Add Individual form
- Group tab + Add -> Add Group form

Inactive entries remain visible in the listing but should use muted / greyed styling.

Do not add separate Active / Inactive tabs in V1.

---

# 9. Individual Model and Form

## 9.1 Fields

Individual should support:

- Icon
- Name
- Relationship
- Description / Remark
- Active
- Internal `isSelf`

## 9.2 Icon

Icon is mandatory.

Use Lucide icons only.

Create or reuse a central constant following the existing project pattern.

Example concept:

```ts
BENEFICIARY_INDIVIDUAL_ICONS
```

Only expose suitable person-related icons instead of every Lucide icon.

Use the existing icon selection UI pattern if available.

## 9.3 Name

- Required
- Max length: 50
- Duplicate beneficiary names are not allowed
- Uniqueness applies across both Individuals and Groups
- Compare names case-insensitively
- Trim leading/trailing whitespace
- Treat normalized equivalent names as duplicates

Examples considered duplicates:

```text
Son
son
 SON
" Son "
```

Use record IDs as the real relationship key in the database.

## 9.4 Relationship

- Optional
- Max length: 50
- UI should provide common suggestions
- Must also allow custom text

Suggested values may include:

- Self
- Partner
- Husband
- Wife
- Son
- Daughter
- Father
- Mother
- Sibling
- Friend
- Colleague
- Other

Do not model relationship as a rigid database enum.

## 9.5 Description / Remark

- Optional
- Max length: 100

## 9.6 Active

For normal Individuals:

- User can activate/deactivate
- Deactivated record remains stored
- Can be reactivated later
- Cannot be deleted

For the self beneficiary:

- Active must remain true
- Do not allow deactivation

---

# 10. Group Model and Form

## 10.1 Fields

Group should support:

- Icon
- Name / Label
- Members
- Description / Remark
- Active

## 10.2 Icon

Icon is mandatory.

Use Lucide icons only.

Create or reuse a central group-specific icon constant.

Example concept:

```ts
BENEFICIARY_GROUP_ICONS
```

Expose only suitable group / household / organisation icons.

## 10.3 Name

- Required
- Max length: 50
- Same cross-type uniqueness rules as Individual

## 10.4 Members

Members are optional.

Rules:

- Only existing Individuals may be selected
- Groups may not contain Groups
- An Individual may belong to multiple Groups
- Members are a many-to-many relationship
- Group membership must not change transaction attribution
- A Group remains a valid standalone beneficiary even if it has no active members

## 10.5 Description / Remark

- Optional
- Max length: 100

## 10.6 Active

- Can be activated/deactivated
- Cannot be deleted
- Can be reactivated later

A Group can remain active even if all of its members are inactive.

---

# 11. Inactive Behavior

Do not implement hard delete for Individuals or Groups.

Use active/inactive semantics only.

## 11.1 When Inactive

Inactive beneficiary:

- remains in the database
- remains linked to historical transactions
- remains linked to historical budget allocations
- does not appear as a selectable option for new transactions
- does not appear as a selectable option for new/current beneficiary budget allocations
- can be reactivated later
- should remain visible in Beneficiary Management with muted styling

## 11.2 Historical Editing

If an existing transaction uses an inactive beneficiary:

- Show that beneficiary as currently selected
- Indicate visually that it is inactive
- Allow saving without changing it
- Do not include inactive beneficiaries as new alternative options
- User may switch to an active beneficiary

---

# 12. Group Member Deactivation

If an Individual is a member of a Group and becomes inactive:

- Do not automatically remove the Individual from the Group
- Keep the membership relationship
- Display the member as inactive in the Group editor
- Group can remain active
- Group can still be selected as a beneficiary

Example:

```text
Parents
- Father (Inactive)
- Mother
```

Do not silently mutate group membership.

---

# 13. Beneficiary Selector Interaction

Reuse the current Category selector interaction pattern shown in Finora.

The desired interaction is an expandable selector with an option panel / card grid, not a basic platform dropdown.

Concept:

```text
For
┌────────────────────────────────┐
│ Me                          ^  │
└────────────────────────────────┘

Expanded
┌────────────────────────────────┐
│ Individuals                 ✎  │
│ [ Me ] [ Son ] [ Wife ]        │
│                                │
│ Groups                         │
│ [ Parents ] [ Family ]         │
└────────────────────────────────┘
```

## 13.1 Grouping

The options panel must visually separate:

- Individuals
- Groups

## 13.2 Selection

Only one beneficiary may be selected.

## 13.3 Edit Shortcut

Include a pencil/edit icon in the expanded beneficiary option panel.

Behavior:

- From Expense selector -> open Beneficiary Management
- From Group member selector -> open Beneficiary Management with Individual tab preselected

When navigating back:

- Return to the originating form/page
- Preserve unsaved form state
- Refresh available beneficiaries so newly created records can immediately be selected

Do not discard the user's draft transaction/group form.

---

# 14. Transaction Form Changes

Apply to the existing Add/Edit Transaction screen.

## 14.1 Expense Layout

Reorganize the form approximately as follows:

```text
Transaction Type
[ Expense ] [ Income ] [ Transfer ]

Transaction Date
[ 2026-09-05 ]

For                     Category
[ Me ▼ ]                [ Meals ▼ ]

Currency                Amount
[ MYR ▼ ]               [ 123.13 ]

Account
[ Maybank ▼ ]

Description
[ ... ]
```

### Layout Requirements

- Move Account below Currency/Amount
- Place `For` on the left side of Category
- Place Transaction Date above both `For` and Category
- Preserve the existing Finora form styling

## 14.2 Visibility

Expense:

- show `For` only if another active beneficiary exists
- if hidden, automatically use self beneficiary

Income:

- do not show beneficiary

Transfer:

- do not show beneficiary

## 14.3 Switching Transaction Type

If user:

1. selects Expense
2. changes beneficiary to Son
3. switches to Income
4. switches back to Expense

Prefer restoring the previously selected Expense beneficiary within the current unsaved form session.

Do not unnecessarily reset it to Me unless the previous value is no longer valid.

---

# 15. Missing Expense Integration

Apply beneficiary support when `Missing Expense` is selected in the account balance-difference workflow.

Recommended layout:

```text
Transaction Date

For                     Category
[ Me ▼ ]                [ Meals ▼ ]

Description
```

Rules:

- Missing Expense -> beneficiary mandatory
- Missing Expense -> default self beneficiary
- Correction -> no beneficiary
- Show/hide beneficiary with the same progressive-disclosure rule as Expense

Move Transaction Date above the `For` / Category row.

Reuse the main transaction beneficiary selector if possible.

---

# 16. Transaction List Display

Update transaction row presentation.

Target layout:

```text
Meals                                      -1,232.13
Lunch - Work · For Me                      Maybank
```

Structure:

- First row: Category | Amount
- Second row: Description + beneficiary | Account

Examples:

```text
Toys                                           -85.00
Birthday gift · For Son                      Maybank
```

```text
Bills                                         -150.00
Electricity · For Parents House                 CIMB
```

If Description is empty:

```text
Bills                                         -150.00
For Parents House                               CIMB
```

Do not display a leading separator.

## 16.1 Important

Do not modify the stored Description value.

`For Me` is separate metadata rendered alongside the description.

## 16.2 Progressive Visibility

If only self exists and beneficiary functionality is hidden, it is acceptable to omit `For Me` from normal transaction list presentation to keep the feature visually invisible.

Historical or advanced views may still use the underlying beneficiary data.

---

# 17. Budget Integration

Extend the current budget/category allocation implementation.

Do not build a parallel budgeting engine.

Reuse:

- existing category allocation logic
- existing budget progress calculation
- existing over-budget visual styling
- existing copy-forward behavior
- existing budget persistence structure where possible

---

# 18. Beneficiary Budget Allocation

A Category allocation may optionally be subdivided into beneficiary allocations.

Concept:

```text
Bills                           500.00
  Beneficiary Allocation
  Me                            100.00
  Parents House                 200.00

  Beneficiary allocated        300.00
  Unallocated                  200.00
```

## 18.1 Expand/Collapse UI

Inside the Edit Budget page, add an expandable beneficiary allocation area under each Category allocation.

The category's existing amount remains the primary category budget.

The beneficiary subsection is optional and collapsed by default unless current UX patterns suggest otherwise.

## 18.2 Validation

For each Category:

```text
sum(beneficiary allocations) <= category allocation
```

Never allow beneficiary allocations to exceed the category allocation.

Full allocation is not required.

Example:

```text
Category Budget = 500
Me = 100
Parents House = 200
Unallocated = 200
```

This is valid.

## 18.3 Duplicate Allocation

The same beneficiary may appear only once within the same Category budget.

Do not allow:

```text
Me = 100
Parents = 200
Me = 50
```

Instead, user edits the existing Me allocation.

## 18.4 Beneficiary Without Allocation

A transaction remains valid even if its beneficiary has no dedicated beneficiary budget allocation.

Example:

```text
Bills Budget = 500
Parents allocation = 200
Me allocation = none
Expense:
- Bills
- For Me
- RM50
```

This is valid.

The RM50:

- counts toward the overall Bills category budget
- does not have beneficiary-budget progress because Me has no explicit beneficiary allocation

Beneficiary allocation is a planning/reporting subdivision, not a restriction on transaction entry.

---

# 19. Budget Over-Allocation / Over-Budget Presentation

Reuse the existing category progress UI and calculation style.

Existing UI pattern:

```text
Bills                         -100.89
200.89 of 100.00 · 200.9%
[progress bar]
```

Use the same logic for beneficiary allocation progress where applicable.

Example:

```text
Bills Category Budget = 500
Parents House Allocation = 100
Parents House Spending = 200.89
```

Category may still be under budget:

```text
Bills
200.89 of 500.00
```

while beneficiary allocation is over:

```text
Parents House
200.89 of 100.00 · 200.9%
```

Do not create a separate visual language for beneficiary over-budget states.

Reuse existing components/calculations/styles where possible.

---

# 20. Inactive Beneficiary Budget Behavior

If a beneficiary is deactivated:

## Current / Future Editable Budgets

- Remove/disable that beneficiary from current/future beneficiary allocation configuration
- Existing active/current editable allocations for the inactive beneficiary should be removed from future use
- Amount previously assigned to that beneficiary becomes category-level unallocated amount

## Historical Budgets

Do not mutate historical budget allocations.

Historical periods must continue to show:

- beneficiary allocation
- spending
- remaining / over-budget state

Historical reports must not change retroactively.

---

# 21. Budget Copy-Forward

Finora already supports copying / rolling budget data forward.

Extend the existing logic.

When a budget is copied to a new period:

- copy category allocations using current behavior
- copy beneficiary allocations for beneficiaries that are active in the target period
- do not copy allocations for inactive beneficiaries
- preserve all other existing copy behavior

Do not implement a new copy mechanism.

---

# 22. Budget Filter

Add a general Filter control to the Budget page rather than a dedicated beneficiary-only control.

This is intentional so future filters can be added to the same panel without increasing page clutter.

Concept:

```text
Filters

Beneficiary
[ Me × ] [ Parents House × ]

Reset
Apply
```

## 22.1 Current Scope

For V1, the filter panel only needs beneficiary filtering unless existing budget filters should be integrated.

## 22.2 Multiple Selection

The filter must support multiple beneficiaries.

Filtering uses OR logic.

Example:

```text
Selected:
- Me
- Parents House

Show transactions/category results where:
beneficiary = Me
OR beneficiary = Parents House
```

Multiple selection in a filter does **not** mean a transaction can have multiple beneficiaries.

---

# 23. Budget Filter Scope

The Budget beneficiary filter affects only the lower Category Progress / category listing section.

It must **not** change the top summary values such as:

- Monthly Budget
- Budget Used
- Spent
- Remaining
- Allocated
- Unallocated

Keep the top summary based on the full budget.

---

# 24. Budget Category Progress When Filtered

When beneficiary filter is active, Category Progress should reflect the selected beneficiaries.

Example:

```text
Bills
Me allocation = 100
Parents allocation = 200

Filter:
- Me
- Parents

Combined selected allocation = 300
Combined selected spending = 200.89
```

Display using the existing card style:

```text
Bills
200.89 of 300.00 · 67.0%
```

Do not add extra card labels like:

```text
Me + Parents
```

Keep the card visually consistent with the existing UI.

The filter control itself may indicate an active filter using existing design conventions such as:

- badge/count
- dot
- highlighted icon

Do not hard-code a new visual style if the app already has a filter-active pattern.

---

# 25. Filtered Beneficiary With No Allocation

If selected beneficiary has spending in a category but has no beneficiary-specific budget allocation:

The category should still appear.

Do not incorrectly use the full category allocation as the beneficiary's target.

Example:

```text
Bills category budget = 500
Me beneficiary allocation = none
Me spending = 150
```

Filtered by Me:

Display information similar to:

```text
Bills
Spent 150.00 · No beneficiary allocation
```

No percentage/progress against a beneficiary target should be calculated because no beneficiary allocation exists.

Reuse current card layout as much as possible without presenting misleading numbers.

---

# 26. Inactive Beneficiaries in Filters

New transaction selectors:

- active beneficiaries only

Historical filters:

- active beneficiaries
- plus inactive beneficiaries that are relevant to the currently displayed period/data

Inactive options should be identifiable, e.g.:

```text
Son (Inactive)
```

This allows users to filter historical data without allowing inactive beneficiaries to be assigned to new transactions.

---

# 27. Category Detail Integration

Add beneficiary filtering to the existing Category Detail page.

Use the same general beneficiary filter logic as Budget.

Place the filter control in the top-right area of the category summary card as appropriate to the existing design.

## 27.1 Navigation From Budget

If user is on Budget with beneficiary filter active:

```text
Budget
Filter = Parents House
```

and taps a Category:

```text
Bills
```

then Category Detail must open with the same beneficiary filter pre-assigned.

## 27.2 Back Navigation

When user presses Back:

- return to the previous Budget page
- preserve current period/month
- preserve beneficiary filter
- preserve previous navigation state
- preserve scroll position if the existing navigation architecture reasonably supports it

Do not open a fresh default Budget page.

---

# 28. Group Member Selector UI

For Add/Edit Group, Members should use an expandable option panel similar to the existing Category selector UI.

Example:

```text
Members
┌───────────────────────────────┐
│ Father, Mother             ^ │
└───────────────────────────────┘

Expanded
┌───────────────────────────────┐
│                            ✎  │
│ [ Father ] [ Mother ] [ Son ] │
└───────────────────────────────┘
```

Rules:

- Multiple Individuals may be selected as Group members
- Groups cannot be selected
- Show active and existing membership states appropriately
- If a member becomes inactive, keep it visible as inactive when editing an existing Group

The pencil icon navigates directly to Beneficiary Management -> Individual tab.

When returning, preserve Group form draft.

---

# 29. Validation Summary

## Individual

- Icon: required
- Name: required, max 50
- Relationship: optional, max 50
- Description: optional, max 100
- Name unique across Individual + Group
- Active: required state
- Self cannot be inactive

## Group

- Icon: required
- Name: required, max 50
- Members: optional
- Description: optional, max 100
- Name unique across Individual + Group
- Group members must be Individuals only
- Individual may belong to multiple Groups

## Expense

- Beneficiary required
- Exactly one beneficiary
- Beneficiary must be active for new selection
- Default self

## Missing Expense

- Same beneficiary rules as Expense

## Budget Beneficiary Allocation

- Beneficiary required per allocation row
- No duplicate beneficiary within the same Category
- Amount must follow existing monetary rules
- Sum must not exceed Category allocation

---

# 30. Suggested Data Model Direction

Codex must inspect the existing schema before choosing exact table names.

Conceptually, the feature needs to support:

## Beneficiary

Possible logical fields:

```text
id
type: INDIVIDUAL | GROUP
icon
name
relationship nullable
description nullable
active
is_self
created_at
updated_at
```

The exact shape may differ based on the existing Finora architecture.

## Group Membership

Many-to-many relationship:

```text
group_beneficiary_id
individual_beneficiary_id
```

Do not permit Group -> Group membership.

## Transaction

Expense / Missing Expense needs a beneficiary reference.

Conceptually:

```text
beneficiary_id
```

Beneficiary reference should be mandatory for applicable newly created records.

## Budget

Add beneficiary allocation support connected to the existing category budget allocation structure.

Do not assume a specific new table if the current schema already has an extensible allocation model.

---

# 31. Database / Persistence Rules

- Do not hard delete beneficiaries
- Preserve foreign-key integrity
- Self beneficiary must remain stable even if renamed
- Use record IDs, never names, as references
- Unique-name validation must be enforced robustly
- Prefer enforcing normalized uniqueness at both application and persistence level where practical
- Follow current migration/versioning conventions
- Preserve SQLite compatibility and current database style

Because Finora has not yet been deployed publicly, no legacy production migration strategy is required beyond safely migrating the current development database structure.

---

# 32. Existing Code Reuse Requirements

Codex should actively search for and reuse:

- Category selector UI
- Icon selector UI
- Floating Add button pattern
- Tab pattern
- Form field components
- Existing Money/Amount input
- Existing validation utilities
- Existing budget allocation components
- Existing progress calculation
- Existing over-budget calculation
- Existing budget copy-forward logic
- Existing repository/service patterns
- Existing SQLite migration pattern
- Existing navigation helpers
- Existing active/inactive UI treatment
- Existing empty-state component
- Existing filter bottom sheet/modal pattern if available

If a common selector can be safely extracted to avoid duplication, do so only if it improves maintainability without creating unnecessary refactoring risk.

---

# 33. i18n

All new user-visible text must use the current i18n system.

Do not hard-code user-facing English strings.

Include translations/keys for at least the application's currently supported languages.

Likely new strings include:

- Beneficiary Management
- Individual
- Group
- For
- Relationship
- Members
- Active
- Inactive
- Beneficiary Allocation
- No beneficiary allocation
- Filter by Beneficiary
- Self
- Description
- Add Individual
- Edit Individual
- Add Group
- Edit Group

Follow existing naming/key conventions.

---

# 34. Accessibility

Follow existing accessibility practices.

Ensure:

- icon-only pencil buttons have accessibility labels
- floating Add buttons have accessibility labels
- beneficiary cards are accessible
- active/inactive state is not represented only by color
- selector controls expose meaningful labels
- form validation errors are accessible

---

# 35. UI Consistency

Do not redesign unrelated screens.

Follow:

- existing Finora spacing
- current colors/theme
- current card shapes
- current typography
- current icon sizing
- current navigation header style
- current floating action button pattern
- existing responsive behavior

The purpose of this task is to add the feature while preserving the current V1 UI direction.

---

# 36. Acceptance Criteria

## Beneficiary Management

- User can open Beneficiary Management from Settings
- User can switch between Individual and Group tabs
- User can add/edit Individuals
- User can add/edit Groups
- User can deactivate/reactivate non-self beneficiaries
- Inactive records remain visible
- No hard delete is available
- Duplicate normalized names are rejected
- Group cannot contain another Group
- Individual may belong to multiple Groups
- Self beneficiary cannot be deactivated

## Transactions

- Expense always has exactly one beneficiary
- Missing Expense always has exactly one beneficiary
- Default beneficiary is self
- Income has no beneficiary
- Transfer has no beneficiary
- Correction has no beneficiary
- `For` is hidden when only self is active
- `For` appears when another active beneficiary exists
- Selector groups Individuals and Groups
- Transaction list displays beneficiary metadata when appropriate

## Budget

- Beneficiary allocation can be added under Category allocation
- Total beneficiary allocation cannot exceed Category allocation
- Beneficiary allocations are optional
- Beneficiary without allocation may still have expenses
- Existing category budget logic remains correct
- Existing over-budget UI is reused
- Filter supports multiple beneficiaries with OR behavior
- Filter affects only Category Progress section
- Multiple selected beneficiary allocations are summed for progress
- No beneficiary labels are added to the existing progress card
- Spending without beneficiary allocation does not incorrectly use full category budget as beneficiary target
- Inactive beneficiary allocations are excluded from current/future copied budgets
- Historical allocations remain intact

## Navigation

- Pencil shortcut can open Beneficiary Management
- Group member pencil opens Individual tab
- Returning preserves originating form state
- Budget -> Category Detail carries beneficiary filter
- Back returns to the same Budget state

---

# 37. Out of Scope for V1

Do not implement:

- Multiple beneficiaries on one transaction
- Amount splitting among beneficiaries
- Group-as-member-of-group
- Income `From` / payer
- Transfer beneficiary
- Beneficiary-based permissions
- Beneficiary-specific accounts
- Automatic allocation of Group transaction amount to Group members
- Hard delete
- Quick-create relationship templates
- Extra seeded beneficiaries besides self
- Redesign of unrelated Finora UI

---

# 38. Final Implementation Guidance

Before implementation:

1. Inspect the current relevant files and data flow.
2. Identify reusable components and existing calculations.
3. Plan the minimum schema changes.
4. Preserve current architecture and naming conventions.
5. Implement database migration.
6. Implement Beneficiary Management.
7. Integrate Expense / Missing Expense.
8. Integrate transaction listing.
9. Extend Budget allocation.
10. Add Budget and Category Detail filtering.
11. Extend copy-forward behavior.
12. Add validation and inactive-state behavior.
13. Add i18n.
14. Run existing tests.
15. Add/update tests for the new business rules.
16. Verify no existing transaction/budget/account behavior regresses.

If an existing implementation detail conflicts with this requirement, prefer the explicit business behavior in this document while preserving the current architecture as much as possible.
