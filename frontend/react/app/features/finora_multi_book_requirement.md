# Finora Multi-Book / Multi-Person Accounting Requirement

## 1. Feature Overview

Finora currently records one user's personal accounting data in a single financial context.

This feature introduces the concept of a **Book**.

A Book represents an independently managed financial context. It allows the user to maintain separate financial records for different people or purposes, for example:

- ME
- Spouse
- Parents
- Child
- Family member
- Other independently managed financial contexts

A Book is different from a Beneficiary.

- **Book** = whose financial records are currently being managed.
- **Beneficiary** = who benefited from a specific transaction.

Example:

```text
Book: ME
Account: Maybank
Expense: RM 100
Beneficiary: Mom
```

This means the money came from the user's own finances but was spent for the user's mother.

A separate Mom Book would only be used when the user is independently managing Mom's own accounts, transactions, balances, reports, etc.

---

# 2. Core Design Principles

## 2.1 One Active Book Context

Finora must maintain one globally selected Book at a time.

All Book-scoped modules must use the currently selected Book as their financial context.

Examples of Book-scoped modules:

- Overview / Dashboard
- Accounts
- Transactions
- Categories
- Budgets
- Credit Cards
- Projects / Events
- Reports
- Transaction Search
- Any future financial module that stores Book-owned data

The currently selected Book should be available from a shared/global application state.

Example conceptual state:

```ts
activeBookId;
activeBook;
```

Do not let individual screens independently determine or maintain the selected Book.

---

## 2.2 Exactly One Book per Financial Record

The following records must belong to exactly one Book:

- Account
- Transaction
- Custom Category
- Budget
- Credit Card configuration
- Credit Card cycle
- Project / Event
- Book-specific settings
- Future Book-owned financial records

A record must never belong directly to multiple Books.

Example:

```text
Transaction A -> ME
Transaction B -> Spouse
```

Do not support:

```text
Transaction C -> ME + Spouse
```

Cross-Book transaction linking may be introduced separately in the future.

---

# 3. Default Book

Finora must always contain one original system Book.

Initial default:

```text
Label: ME
```

The ME Book:

- is automatically created by the system
- cannot be deleted
- cannot be made inactive
- can be renamed
- can change icon
- can change description
- remains identifiable as the original system Book even after being renamed

Do not identify the original system Book by label.

Use an immutable property such as:

```text
is_system_default = true
```

Example:

```text
Initial label: ME
Renamed by user: Personal
```

Finora must still know that this is the original system Book.

---

# 4. Book Data Model

Suggested Book entity:

```text
books
-----
id
label
normalized_label
description
icon
is_active
is_system_default
sort_order
created_at
updated_at
```

Exact field naming may follow the existing Finora database naming convention.

## 4.1 Field Definitions

### id

Unique identifier.

### label

User-visible Book name.

Examples:

```text
ME
Spouse
Parents
Dad
Mom
```

Required.

### normalized_label

Persisted normalized value used for Book-name uniqueness checking.

Required.

### description

Optional text.

Example:

```text
Accounts and expenses managed for my parents.
```

The description is mainly used in Book Management / Book Detail.

It should not normally be shown in the Book Switcher.

### icon

User-selectable icon representing the Book.

Required or populated with a system default.

### is_active

Boolean.

```text
true  = active
false = inactive/read-only
```

### is_system_default

Boolean.

Only the original system-created Book should use:

```text
true
```

All user-created Books:

```text
false
```

### sort_order

Used for Book display ordering.

This allows future drag-and-drop or manual sorting without schema changes.

---

# 5. Book Label Uniqueness

Book names must be unique.

Uniqueness must use normalized comparison instead of only raw string comparison.

Recommended normalization:

1. Unicode NFKC normalization
2. trim outer whitespace
3. collapse repeated internal whitespace
4. case-insensitive comparison

Examples that must conflict:

```text
Parents
parents
 Parents
PARENTS
```

These must also normalize equivalently where applicable:

```text
Parents   House
parents house
```

SQLite `NOCASE` alone should not be relied on for robust Unicode-equivalent comparison.

Persist `normalized_label` and enforce uniqueness against it.

---

# 6. Book Management

Add a new section in:

```text
Settings
  -> Book Management
```

The Book Management page allows the user to:

- view all Books
- view active Books
- view inactive Books
- add a Book
- open Book Detail
- edit Book properties
- activate a Book
- deactivate a Book
- manage Book ordering later if supported

Do not provide hard delete in V1.

Inactive status is the standardized archive behavior.

---

# 7. Book Management List

The list should show both active and inactive Books.

Suggested row content:

```text
[Icon] Label
       Active / Inactive
```

Optional:

```text
System Book
```

for the original system Book if useful.

Book description does not need to appear in the main list unless UI space allows it.

Pressing a row opens Book Detail.

---

# 8. Create Book

Suggested fields:

```text
Icon
Label
Description
```

System-controlled fields should not be manually entered:

```text
is_active = true
is_system_default = false
```

Label is required.

Description is optional.

Icon may use a default if the user does not explicitly select one.

---

# 9. Book Creation Initialization

After a new Book is saved, Finora must initialize the Book's required system-created data.

Examples include:

- default/system categories
- Book-specific category mappings
- Book-specific configuration
- other system-generated records required for a newly usable Book
- future initialization data

Do not spread initialization logic across UI screens.

Use one centralized Book initialization flow.

Conceptually:

```text
createBook()
    ->
initializeBook()
    -> create default categories
    -> create Book-level settings
    -> create required system data
```

## 9.1 Atomic Creation

Book creation and required initialization should be transactional where practical.

Desired behavior:

```text
Create Book
+ Initialize required Book data
= success together
```

Avoid leaving a Book in a partially initialized state.

Example of an invalid partial state:

```text
Spouse Book exists
but required categories were not initialized
```

If initialization fails, the operation should either:

- roll back the Book creation, or
- clearly mark initialization incomplete and safely recover

Rollback is preferred where supported.

---

# 10. Active and Inactive Books

## 10.1 Active Book

Active Book behavior:

- can be selected normally
- can create records
- can edit records
- can delete/archive records according to existing module rules
- all standard Book-scoped functionality is available

---

## 10.2 Inactive Book

Inactive means archived/read-only, not deleted.

Users must still be allowed to inspect historical records.

Allowed:

- switch into the inactive Book when explicitly shown
- view Overview / Dashboard
- view accounts
- open account details
- view transactions
- open transaction details
- view categories
- view reports
- search historical records
- view budgets
- view projects
- view credit-card data
- navigate through other historical Book-owned data

Not allowed:

- add transaction
- edit transaction
- add account
- edit account
- add category
- edit category
- add budget
- edit budget
- add project/event
- edit project/event
- add or edit credit-card configuration
- perform any other Book-scoped write operation

The same rule must apply consistently to future modules.

---

# 11. Inactive Book UI Behavior

When the active Book is inactive:

- create buttons should be hidden or disabled
- edit buttons should be hidden or disabled
- press actions used only to edit must not be functional
- rows that normally open view/detail pages remain pressable
- historical navigation remains available

If an existing detail page combines view and edit behavior, it must enter a read-only mode for inactive Books.

Suggested status banner:

```text
This book is inactive.
Records are read-only.
```

Optional action:

```text
Reactivate
```

This action should only appear where appropriate and should route to or perform Book reactivation according to Book Management UX.

---

# 12. Deactivating Books

V1 should not expose hard deletion.

All removable Books become inactive instead.

Rules:

- system default Book cannot be deactivated
- user-created Books can be deactivated
- deactivation preserves all historical data
- inactive Books are hidden from the normal Book selector
- inactive Books can be reactivated from Book Management
- inactive Books can optionally be revealed from the Book Switcher using "Show inactive books"

---

# 13. App Startup Book Selection

Finora should remember the user's last selected Book.

Startup logic:

```text
1. Load last selected Book
2. If it exists and is active:
      use it
3. Otherwise:
      fall back to system default Book
```

The system default Book is always guaranteed to be available and active.

Do not automatically reset to ME every time the app is opened.

---

# 14. Book Switching UX

Book switching should be a deliberate action.

Do not allow switching from every page.

Primary switching locations:

1. Overview / Dashboard
2. Book Management

The selected Book may be displayed as context on other Book-scoped pages, but it should not normally be switchable there.

This reduces:

- accidental Book changes
- form-context problems
- header clutter
- unnecessary UI complexity

---

# 15. Book Indicator on Book-Scoped Pages

Every Book-scoped page should visibly communicate the current Book.

However, the indicator does not have to be large.

Possible display:

```text
[Book Icon] ME
```

or:

```text
Transactions                  [Icon] ME
```

The indicator is informational only on normal pages.

It should not necessarily contain:

```text
chevron
dropdown
switch action
```

The goal is:

> The user should always know which Book's data is currently being viewed.

---

# 16. Pages That Should Show Book Context

Examples:

- Overview / Dashboard
- Accounts
- Account Detail
- Transactions
- Transaction Detail
- Categories
- Budgets
- Reports
- Credit Cards
- Projects / Events
- Global Transaction Search
- other Book-scoped modules

---

# 17. Pages That Do Not Need Book Context

Examples:

- Settings home
- Book Management
- Appearance
- Language
- Security
- Backup / Restore
- About
- other application-global settings

These pages are not owned by a Book.

---

# 18. Create / Edit Screens

Do not allow Book switching while inside create/edit flows.

Examples:

- Add Transaction
- Edit Transaction
- Add Account
- Edit Account
- Add Category
- Edit Category
- Add Budget
- Edit Budget
- Add Project
- Edit Project

The form automatically inherits:

```text
activeBookId
```

No additional Book selector field should be required inside normal create/edit forms.

Example:

```text
Current active Book: Spouse

User presses Add Expense

New transaction:
book_id = spouseBookId
```

The form may display:

```text
[Icon] Spouse
```

as read-only context.

---

# 19. Overview / Dashboard Book Selector

Overview / Dashboard is the main location for switching Books.

Suggested display:

```text
[Book Icon] ME
```

Pressing the control opens the Book Switcher.

This control should be visually discoverable without consuming too much header space.

---

# 20. Floating Book Button

A movable/draggable floating button is technically possible in React Native but is not required for V1.

Do not implement a draggable floating Book switch button as the default UX.

Reasons:

- may cover useful content
- adds gesture complexity
- can be moved accidentally
- creates layout edge cases
- introduces unnecessary persistence/state requirements
- creates inconsistent placement

If future usability testing shows a need for faster Book switching, a fixed-position Book FAB may be considered separately.

For V1, prefer:

```text
Overview / Dashboard -> Book Switcher
Settings -> Book Management
```

---

# 21. Book Switcher

Book Switcher should be presented as a compact modal, bottom sheet, or equivalent overlay.

It should not require a full navigation flow unless the existing app architecture makes that preferable.

Suggested content:

```text
Switch Book

[Icon] ME          ✓
[Icon] Spouse
[Icon] Parents

[ ] Show inactive books

+ Add Book
Manage Books
```

---

# 22. Book Switcher Display Content

Each Book should primarily display:

```text
Icon + Label
```

Do not show Book description in the Book Switcher.

Description belongs in:

- Book Management
- Book Detail
- Edit Book

---

# 23. Inactive Books in Book Switcher

Default behavior:

```text
Show inactive books = false
```

Only active Books are shown.

When:

```text
Show inactive books = true
```

inactive Books must also appear.

Inactive Books should have a clear visual status such as:

```text
Inactive
```

or equivalent styling.

The user may select an inactive Book.

After selection:

```text
activeBook = inactive Book
```

Finora enters Book-wide read-only mode.

---

# 24. Book Switcher Interaction

When selecting a Book:

1. update global `activeBookId`
2. persist last selected Book
3. close Book Switcher
4. reload / invalidate Book-scoped data
5. return the user to the appropriate current page or Overview according to existing navigation behavior

Do not leave stale data from the previous Book visible.

---

# 25. Book-Level Data Filtering

All Book-owned data queries must include Book context.

Example:

```text
getAccounts(activeBookId)
getTransactions(activeBookId)
getBudgets(activeBookId)
```

Equivalent database filtering:

```sql
WHERE book_id = ?
```

Do not rely only on frontend filtering.

Book scoping should be enforced at the data-access/repository layer where possible.

---

# 26. Existing Data Migration

Existing Finora users already have data without a Book.

A database migration must:

1. create the system default Book
2. set its label initially to `ME`
3. set:
   ```text
   is_system_default = true
   is_active = true
   ```
4. assign all existing Book-owned records to the system default Book
5. initialize any required Book-level system records
6. persist the system default Book as the initial active Book if no existing preference exists

Migration must preserve all existing financial data.

No existing transaction/account/category should be lost.

---

# 27. Database Schema Changes

Add `book_id` to relevant Book-owned tables.

Examples:

```text
accounts
transactions
categories/custom_categories
budgets
credit_card_settings
credit_card_cycles
projects
events
book-owned future tables
```

The exact list must be determined from the current Finora schema.

Where appropriate:

```text
book_id NOT NULL
```

after migration has populated existing rows.

Add indexes for Book-scoped queries.

Examples:

```sql
INDEX(book_id)
INDEX(book_id, date)
INDEX(book_id, account_id)
INDEX(book_id, category_id)
```

Actual index design should match existing queries.

---

# 28. System Categories and Categories

When a new Book is created, Book-required category data must be initialized automatically.

The implementation should preserve the distinction between:

- global/system category templates if currently used
- Book-specific category records/mappings
- user-created custom categories

Any custom category created inside a Book belongs only to that Book.

A user must not accidentally see another Book's custom category during transaction entry.

---

# 29. Accounts

Every Account belongs to exactly one Book.

Example:

```text
ME
  Maybank
  TNG
  Cash

Spouse
  Maybank
  Cash
```

Account listings must show only the current Book's accounts unless a feature explicitly requests cross-Book data.

An inactive Book's accounts remain viewable but read-only.

---

# 30. Transactions

Every Transaction belongs to exactly one Book.

New transaction behavior:

```text
transaction.book_id = activeBookId
```

Do not add a normal Book dropdown into Add Transaction.

The active Book defines the transaction context.

Inactive Book:

- transaction listing is viewable
- transaction detail is viewable
- add/edit/delete/other write behavior is disabled according to the read-only rule

---

# 31. Beneficiaries

Beneficiaries remain global.

Do not make Beneficiaries Book-owned.

A Beneficiary can be used by transactions from different Books.

Example:

```text
Beneficiary: Son
```

may be referenced by:

```text
Book: ME
Book: Spouse
```

The beneficiary itself represents who benefited from the transaction, not whose financial Book owns the transaction.

Beneficiary management remains global unless separately changed in a future requirement.

---

# 32. Global Transaction Search

Default search scope:

```text
Current Book
```

Add search filtering support for:

```text
Current Book
All Books
Specific Book
```

Recommended filter:

```text
Book:
- Current Book
- All Books
- ME
- Spouse
- Parents
...
```

---

# 33. Search Result Book Indicator

When search scope may include multiple Books, each transaction result must show its Book context.

Example:

```text
RM 50.00
Dinner
Food · Maybank
[Icon] ME
```

This prevents ambiguity when Books contain similar:

- account names
- category names
- descriptions

---

# 34. Inactive Books in Search

Historical records from inactive Books should remain searchable.

Recommended behavior:

```text
Current Book
```

If current Book is inactive:

- search that inactive Book normally in read-only mode

For:

```text
All Books
```

include inactive Books by default, unless the current search UI introduces a separate filter.

Optional future filter:

```text
Include inactive books
```

Do not remove inactive historical records from global search access.

---

# 35. Book-Specific Write Guard

Do not rely only on disabled UI buttons.

All Book-scoped create/update/delete operations must validate that the target Book is active.

Conceptually:

```ts
if (!book.isActive) {
  throw new Error("Inactive books are read-only");
}
```

This validation should exist in an appropriate service/repository/domain layer.

UI disabling is for UX.

Data-layer validation is for integrity.

---

# 36. Read-Only Module Behavior

Create a reusable concept/helper for determining whether the current Book is writable.

Example:

```ts
const isBookReadOnly = !activeBook.isActive;
```

Use this consistently across modules.

Avoid implementing slightly different inactive logic separately in every screen.

Possible reusable rules:

```text
canCreate = activeBook.isActive
canEdit = activeBook.isActive
canDelete = activeBook.isActive
canView = true
```

---

# 37. Navigation and Unsaved Forms

The Book must not switch during an active create/edit workflow.

Because normal create/edit pages do not provide a switch action, this should rarely occur.

If a future global switching action exists, it must respect unsaved-form protection.

Do not silently change Book context underneath a partially completed form.

---

# 38. React Native State Architecture

Use the application's current state-management pattern.

Introduce a shared Book context/store/service containing at minimum:

```ts
activeBookId
activeBook
setActiveBook(...)
loadLastSelectedBook(...)
```

Responsibilities:

- resolve active Book
- persist selected Book ID
- validate fallback Book
- notify Book-scoped modules when Book changes
- expose `isActive`
- expose system-default status if required

Do not duplicate this logic in individual pages.

---

# 39. Persistence of Selected Book

Persist the last selected Book locally.

Possible implementation should follow the application's existing local-preference architecture.

On app startup:

```text
load persisted Book ID
-> resolve Book
-> ensure valid
-> use Book
```

Fallback:

```text
system default Book
```

---

# 40. Book Detail / Edit

Book Detail should support:

```text
Icon
Label
Description
Status
```

For normal Books:

```text
Active <-> Inactive
```

For system default Book:

```text
Active only
```

Disable or hide the control that would make the system default Book inactive.

The system default Book may still allow:

- rename
- icon change
- description change

---

# 41. Book Reactivation

An inactive Book can be reactivated.

After reactivation:

- all historical records remain unchanged
- create/edit capabilities become available again
- Book returns to normal Book Switcher results
- Book-scoped modules become writable

No data recreation should occur during reactivation unless explicitly required by future schema migration logic.

Do not rerun normal Book initialization in a way that duplicates default records.

---

# 42. System Default Book Restrictions

The original system Book:

```text
is_system_default = true
```

must always satisfy:

```text
is_active = true
```

Reject attempts to deactivate it at the application/service layer.

Do not depend only on hiding the UI control.

---

# 43. Error Handling

Handle at least:

### Duplicate Book label

Example message:

```text
A book with this name already exists.
```

### Initialization failure

Do not silently leave a broken Book.

### Invalid persisted active Book

Fallback to system default.

### Inactive Book write attempt

Example:

```text
This book is inactive and cannot be modified.
```

### Missing Book

If a Book record is unexpectedly unavailable, recover safely to the system default Book where appropriate.

---

# 44. Loading Behavior During Book Switch

When switching Books:

- avoid briefly showing the previous Book's data under the new Book label
- clear or invalidate stale Book-owned state
- show existing loading UI where needed
- refresh queries using the new `activeBookId`

Book switch should be treated as a global context change.

---

# 45. Book Scope and Cached Data

Any caches for Book-owned modules must include `book_id` in their key.

Incorrect:

```text
transactions
accounts
categories
```

Preferred conceptually:

```text
transactions:{bookId}
accounts:{bookId}
categories:{bookId}
```

This avoids cross-Book data leakage.

---

# 46. Book Scope and Recent Values

Book-dependent convenience data should normally be Book-scoped.

Examples:

- recent transaction descriptions
- account-specific recent fields
- recent transaction suggestions
- search history if it depends on Book financial data

Do not automatically share Book-dependent financial suggestions between Books unless explicitly intended.

Global user preferences remain global.

Currency configuration that affects financial entry and reporting is Book-scoped. Each Book owns its enabled currencies, default currency, and reporting-currency selection. The currency catalogue itself remains global.

---

# 47. Global vs Book-Owned Data

Recommended scope:

| Data                                 | Scope                   |
| ------------------------------------ | ----------------------- |
| App language                         | Global                  |
| Theme / appearance                   | Global                  |
| Security / PIN / biometric           | Global                  |
| Books                                | Global                  |
| Beneficiaries                        | Global                  |
| Currency catalogue                   | Global                  |
| Enabled/default currency preferences | Book                    |
| Reporting-currency selection         | Book                    |
| System templates                     | Global                  |
| Accounts                             | Book                    |
| Transactions                         | Book                    |
| Custom categories                    | Book                    |
| Budgets                              | Book                    |
| Credit-card settings/cycles          | Book                    |
| Projects / Events                    | Book                    |
| Reports                              | Calculated per Book     |
| Recent financial suggestions         | Book                    |
| Search scope                         | Current Book by default |

---

# 48. Cross-Book Transfers

Cross-Book transfers are not part of this V1 requirement.

Do not automatically create linked transactions between Books yet.

Example future feature:

```text
From:
ME / Maybank

To:
Spouse / Maybank

RM 500
```

could later create linked entries.

For this requirement, transactions remain independently owned by one Book only.

---

# 49. Combined Multi-Book Overview

A combined household/net-worth overview across Books is not required in this version.

Do not sum Books automatically.

Reasons include:

- different ownership
- different currencies
- double counting
- cross-Book transfers
- Books such as Parents that should not count as the user's assets

Reports and Overview are Book-specific by default.

A cross-Book dashboard may be designed separately later.

---

# 50. Book Switcher UI Example

Example only:

```text
Switch Book

┌────────────┐
│    👤      │
│    ME      │
│     ✓      │
└────────────┘

┌────────────┐
│    ❤️      │
│  Spouse    │
└────────────┘

┌────────────┐
│    👵      │
│  Parents   │
└────────────┘

☐ Show inactive books

+ Add Book
Manage Books
```

Actual design should follow the current Finora component system.

---

# 51. Inactive Book Example

```text
Parents                       [Icon] Parents

This book is inactive.
Records are read-only.

Accounts
- Public Bank
- Cash

Transactions
- Medical RM 100
- Groceries RM 85
```

Do not show active create controls.

Detail navigation remains available.

---

# 52. Overview Example

```text
Overview

[👤 ME]

Total Balance
RM 18,420

Accounts
...

Recent Transactions
...
```

Pressing:

```text
[👤 ME]
```

opens Book Switcher.

---

# 53. Normal Page Example

```text
Transactions                👤 ME

September 2026
...
```

The Book indicator is informational.

It is not required to open the Book Switcher from this screen.

---

# 54. Add Form Example

```text
Add Expense                 👤 ME

Amount
Account
Category
Description
Beneficiary
...
```

`ME` is read-only context.

There is no Book field.

---

# 55. Acceptance Criteria

## Book Creation

- [ ] User can open Book Management from Settings.
- [ ] User can create a Book.
- [ ] Book requires a unique label.
- [ ] Duplicate normalized labels are rejected.
- [ ] User can configure icon.
- [ ] User can configure description.
- [ ] New Book is active by default.
- [ ] New Book is not the system default.
- [ ] Required Book system data is initialized.
- [ ] Initialization does not produce duplicate default data.

## Default Book

- [ ] Existing users receive a system default Book through migration.
- [ ] New users receive a system default Book.
- [ ] Initial label is ME.
- [ ] ME can be renamed.
- [ ] ME icon can be changed.
- [ ] ME description can be changed.
- [ ] System default Book cannot be deleted.
- [ ] System default Book cannot be made inactive.
- [ ] System default Book remains identifiable after rename.

## Book Selection

- [ ] Finora remembers the last selected active Book.
- [ ] App startup restores the last selected Book.
- [ ] Invalid/inactive persisted selection falls back to system default where required by startup rules.
- [ ] Overview provides Book switching.
- [ ] Book Management provides Book access/management.
- [ ] Other normal Book-scoped pages show current Book context.
- [ ] Normal create/edit forms do not allow Book switching.

## Book Switcher

- [ ] Shows active Books by default.
- [ ] Displays icon + label.
- [ ] Does not require description.
- [ ] Has a Show inactive books option.
- [ ] Inactive Books can be selected when shown.
- [ ] Selecting an inactive Book opens it in read-only mode.
- [ ] Switching Book refreshes Book-owned content.
- [ ] Old Book data is not shown under the newly selected Book.

## Inactive Books

- [ ] User-created Book can be made inactive.
- [ ] Inactive Book retains all data.
- [ ] Inactive Book is hidden from normal Book Switcher.
- [ ] Inactive Book appears when Show inactive books is enabled.
- [ ] Inactive Book remains viewable.
- [ ] Account details remain viewable.
- [ ] Transaction details remain viewable.
- [ ] Reports remain viewable.
- [ ] Search remains available.
- [ ] Create actions are unavailable.
- [ ] Edit actions are unavailable.
- [ ] Write operations are rejected at service/data layer.
- [ ] Inactive Book can be reactivated.
- [ ] Reactivation restores normal editing capability.

## Data Ownership

- [ ] Every Account belongs to one Book.
- [ ] Every Transaction belongs to one Book.
- [ ] Every custom Book-owned record belongs to one Book.
- [ ] Queries use Book scope.
- [ ] Caches include Book identity.
- [ ] Existing records migrate to the system default Book.

## Beneficiaries

- [ ] Beneficiaries remain global.
- [ ] A Beneficiary can be used by transactions from multiple Books.
- [ ] Beneficiary does not determine transaction Book ownership.

## Global Search

- [ ] Default search scope is Current Book.
- [ ] User can search All Books.
- [ ] User can filter to a specific Book.
- [ ] Multi-Book results display Book icon/label.
- [ ] Historical records from inactive Books remain searchable.

---

# 56. Out of Scope for This Requirement

Do not implement as part of this feature unless already required elsewhere:

- Cross-Book linked transfers
- Shared transactions across multiple Books
- Multi-Book combined net worth
- Household consolidated reports
- Book sharing with another Finora user
- Cloud multi-user collaboration
- Book permissions / roles
- Book-level access control
- Hard delete of Book
- Draggable floating Book switch button
- Beneficiary migration into Book scope

These may be separate future features.

---

# 57. Implementation Guidance

Codex should first inspect the current Finora architecture and reuse existing patterns.

Before implementation, identify:

- current SQLite migration version
- all Book-owned tables
- current category initialization logic
- current global state/store/context solution
- existing settings persistence mechanism
- current search query implementation
- existing account/category/transaction repositories
- current create/edit permission handling
- existing UI header patterns

Avoid unnecessary framework changes.

Do not introduce a new state library solely for this feature if the existing application already has an appropriate state-management mechanism.

Reuse the existing design system/components where practical.

---

# 58. Recommended Implementation Order

1. Add Book table/schema.
2. Add migration creating system default Book.
3. Add `book_id` to existing Book-owned records.
4. Migrate existing data to the system default Book.
5. Add Book repository/service.
6. Add centralized Book initialization service.
7. Add active Book global state.
8. Add last-selected Book persistence.
9. Update repositories/queries to require Book scope.
10. Add Book Management.
11. Add Create/Edit Book.
12. Add Overview Book indicator and Book Switcher.
13. Add read-only inactive Book guards.
14. Update all Book-scoped modules.
15. Update Global Search with Book filters.
16. Add Book context to multi-Book search results.
17. Add tests for migration, switching, uniqueness, and inactive Book write protection.
18. Verify existing single-Book behavior remains unchanged for users who never create another Book.

---

# 59. Backward Compatibility Goal

For a user who never creates another Book, Finora should behave almost exactly like it does today.

The user starts with:

```text
ME
```

All existing data appears under that Book.

The new Book architecture should not force additional Book fields into normal transaction/account/category forms.

The multi-Book feature should feel additive rather than disruptive.

# 60. Reuse Existing Finora Components and Architecture

Before implementing this feature, inspect the existing Finora codebase and reuse the current components, hooks, services, repositories, utilities, layouts, and UI patterns wherever possible.

Do not create new reusable components, abstractions, or libraries unless the existing implementation cannot reasonably support the requirement. Prefer extending or adapting the current code structure instead of introducing duplicate components or a new architecture.

The implementation must follow the existing Finora coding style, folder structure, state-management approach, database/repository patterns, navigation patterns, and design system so that this feature remains consistent with the current application.
