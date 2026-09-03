# Finora - Global Transaction Search

## 1. Objective

Add a global transaction search feature to Finora.

The purpose of this feature is to allow users to quickly find historical transactions across all accounts, categories, currencies, and dates by entering a keyword and optionally applying filters.

For the first version, global search only searches **transactions**.

Do not implement search results for:

- Accounts as standalone search results
- Categories as standalone search results
- Budgets
- Settings
- Attachments
- Receipt OCR
- Other entities

The architecture may remain extensible for future search features, but do not over-engineer the current implementation.

---

## 2. Search Entry Point

### Dashboard

Add a search icon to the Dashboard.

The search icon should be treated as a global action and should be placed in the top-right area of the Dashboard.

Preferred placement:

- Top-right of the Dashboard/header area
- Do not place it inside the transaction FAB
- Do not add Search as a bottom navigation tab
- Do not add a full search input directly to the Dashboard

Example concept:

```text
┌─────────────────────────────────┐
│                            🔍   │
│                                 │
│ ‹   2026-09-01 - 2026-09-03 📅 ›│
│                                 │
│ Balance                         │
│ 109.22                          │
└─────────────────────────────────┘
```

Use the existing icon library already used by Finora where possible.

Do not introduce another icon library only for this feature.

---

## 3. Navigation

When the user presses the search icon, navigate to a dedicated transaction search page.

Example route:

```text
/transaction-search
```

Use the existing Expo Router/navigation conventions used by Finora.

The exact route/file name should follow the current project structure.

Do not restructure existing navigation unnecessarily.

---

## 4. Search Page UI

Create a dedicated Search Transactions page.

Suggested layout:

```text
←  Search Transactions

┌────────────────────────────────┐
│ 🔍 Search transactions...   × │
└────────────────────────────────┘

[ Filters ]

Recent Searches
─────────────────────────────────
Watsons
Electric Bill
Grab

Search Results
─────────────────────────────────

Bills
JPY · OCBC
Water Bill                   -JPY 50

Bills
MYR · Maybank
Electric Bill               -MYR 120
```

The search field should:

- Autofocus when the page is opened
- Show a search icon
- Allow the user to clear the current keyword
- Trim leading/trailing whitespace
- Not execute a keyword search for an empty keyword unless filters are applied
- Support normal keyboard submission
- Also support automatic searching with debounce

Recommended debounce:

```text
300 ms
```

Use an existing debounce utility if one already exists.

Avoid querying SQLite on every keystroke without debounce.

---

## 5. Search Scope

Global search should search across **all transactions**.

It must NOT inherit the Dashboard's currently selected date range.

Example:

Dashboard currently shows:

```text
2026-09-01 → 2026-09-03
```

User searches:

```text
Watsons
```

The result should still include a Watsons transaction from:

```text
2026-03-10
```

The Dashboard date range must not affect global search.

The Search page has its own optional filters, including its own date range filter.

---

## 6. Searchable Fields

For V1, search the following transaction-related fields:

1. Transaction description
2. Category label
3. Account label
4. Transaction amount

Current verified database fields:

```text
transactions.descriptions
categories.label
accounts.label
```

For amount search, inspect the current transaction schema and use the actual stored amount field(s). Do not guess field names.

Do not search arbitrary database columns.

For example, do not include:

- IDs
- created_by
- updated_at
- foreign key IDs
- attachment paths
- internal flags
- technical metadata

The goal is to search fields users are likely to remember.

---

## 7. Text Search Matching

Text search should be case-insensitive.

For example, all of the following should match:

```text
bill
Bill
BILL
bIlL
```

Use:

```sql
LOWER(...)
```

or another SQLite-compatible equivalent consistent with the existing implementation.

Partial matching should be supported.

Searching:

```text
bill
```

should be able to match:

```text
Bill
Bills
Water Bill
Electric Bill
Billing
Monthly Bills
```

Use `%keyword%` for contains matching.

---

## 8. Search Ranking

Search results must first be ranked based on relevance.

Use the following initial ranking rules.

### Description exact match

```text
description = keyword
```

Score:

```text
100
```

Example:

Keyword:

```text
bill
```

Transaction description:

```text
Bill
```

Score:

```text
100
```

### Description starts with keyword

```text
description LIKE 'keyword%'
```

Score:

```text
80
```

Examples:

```text
Bills
Bill Payment
Billing
```

### Description contains keyword

```text
description LIKE '%keyword%'
```

Score:

```text
60
```

Examples:

```text
Electric Bill
Water Bill
Monthly Bill Payment
```

### Category match

If category label contains the keyword:

```text
+20
```

### Account match

If account label contains the keyword:

```text
+10
```

Amount search should not use the same text relevance score rules. See the Amount Search section.

---

## 9. Combined Search Score

Text-match scores should be additive.

Example:

Keyword:

```text
bill
```

Transaction:

```text
Description: Bill
Category: Bills
Account: Maybank
```

Possible score:

```text
Description exact    +100
Category contains     +20
Account no match       +0
────────────────────────
Total                 120
```

This is intentional.

A transaction that matches multiple relevant text fields should rank higher.

---

## 10. Result Ordering

For normal text search, order results by:

1. `search_score DESC`
2. Most recent transaction second

Current working query uses:

```sql
ORDER BY
  search_score DESC,
  t.created_at DESC
```

Keep this behavior unless the existing transaction model has a more appropriate actual transaction/business date field.

Do not replace `created_at` with another field without checking the existing schema and business meaning first.

For filter-only or amount-only searches where `search_score` is not meaningful, order by the most appropriate transaction date descending.

---

## 11. Verified SQL Reference

The following SQL has already been manually executed successfully against the current Finora database and should be used as the behavioral reference for text search.

Do not hard-code `'bill'` values in production code.

Replace the keyword with parameterized query arguments.

```sql
SELECT 
  t.*, 
  c.label AS category_name, 
  a.label AS account_name, 

  ( 
    CASE 
      WHEN LOWER(t.descriptions) = LOWER('bill') THEN 100 
      WHEN LOWER(t.descriptions) LIKE LOWER('bill%') THEN 80 
      WHEN LOWER(t.descriptions) LIKE LOWER('%bill%') THEN 60 
      ELSE 0 
    END 

    + 

    CASE 
      WHEN LOWER(COALESCE(c.label, '')) LIKE LOWER('%bill%') THEN 20 
      ELSE 0 
    END 

    + 

    CASE 
      WHEN LOWER(COALESCE(a.label, '')) LIKE LOWER('%bill%') THEN 10 
      ELSE 0 
    END 

  ) AS search_score 

FROM transactions t 

LEFT JOIN categories c 
  ON c.id = t.category_id 

LEFT JOIN accounts a 
  ON a.id = t.account_id 

WHERE 
  LOWER(t.descriptions) LIKE LOWER('%bill%') 
  OR LOWER(COALESCE(c.label, '')) LIKE LOWER('%bill%') 
  OR LOWER(COALESCE(a.label, '')) LIKE LOWER('%bill%') 

ORDER BY 
  search_score DESC, 
  t.created_at DESC;
```

---

## 12. Production Query Parameterization

Do NOT build SQL like:

```ts
`WHERE descriptions LIKE '%${keyword}%'`
```

Do not directly interpolate user input into SQL.

Use SQLite query parameters.

Conceptually:

```ts
const normalizedKeyword = keyword.trim();

const exactKeyword = normalizedKeyword;
const startsWithKeyword = `${normalizedKeyword}%`;
const containsKeyword = `%${normalizedKeyword}%`;
```

Then use parameters:

```sql
CASE
  WHEN LOWER(t.descriptions) = LOWER(?) THEN 100
  WHEN LOWER(t.descriptions) LIKE LOWER(?) THEN 80
  WHEN LOWER(t.descriptions) LIKE LOWER(?) THEN 60
  ELSE 0
END
```

The final parameter list must correspond correctly to the final SQL placeholders.

All filter and amount values must also use parameter binding.

---

## 13. NULL Handling

Category/account values may potentially be `NULL`.

Continue using:

```sql
COALESCE(field, '')
```

Example:

```sql
LOWER(COALESCE(c.label, ''))
```

This prevents NULL values from breaking matching behavior.

Also handle nullable transaction fields according to the actual schema.

---

## 14. Repository / Database Layer

Implement search in the existing database/repository architecture.

Do not place raw database logic directly inside the UI component if Finora already has repository/service/database abstractions.

Prefer an API conceptually similar to:

```ts
searchTransactions({
  keyword,
  filters,
  limit,
  offset,
})
```

The query builder/search repository should support:

- Optional keyword
- Optional amount search
- Optional filters
- Pagination
- Relevance ranking when text search is active

Reuse existing transaction types where possible.

Avoid duplicating a large transaction model only for search.

---

## 15. Pagination

Search results must support pagination.

Do not load every matching transaction into memory.

Reuse Finora's existing pagination conventions where possible.

Use:

```sql
LIMIT ? OFFSET ?
```

Suggested API:

```ts
searchTransactions({
  keyword,
  filters,
  limit: PAGE_SIZE,
  offset,
});
```

Initial search:

```text
offset = 0
```

Load more:

```text
offset += PAGE_SIZE
```

Use the existing `PAGE_SIZE` constant if one already exists and is appropriate.

Do not create another pagination convention unnecessarily.

---

## 16. New Search Behaviour

Whenever the keyword or any filter changes, reset the previous search state.

Example:

```text
bill
↓
watsons
```

or:

```text
Account: Maybank
↓
Account: OCBC
```

Reset:

- results
- offset/page
- `hasMore`
- loading state as appropriate

Then execute the new search from the beginning.

Do not append results from different search criteria together.

---

## 17. Loading States

Support at least two separate loading scenarios.

### Initial Search Loading

When executing the first page:

```text
Searching...
```

or use the application's existing loading component.

### Load More

When loading the next page, show a footer loading indicator without replacing the existing results.

Do not make the full screen flash/reload every time pagination occurs.

---

## 18. Empty States

### No keyword and no filters

When the search field is blank and no filters are applied, show an initial state such as:

```text
Search your transactions
```

Optionally include helper text:

```text
Search by description, category, account, or amount.
```

Recent search history may also be displayed in this state.

### No matches

If a valid search or filter combination produces zero results, show:

```text
No transactions found
```

Optionally:

```text
No transactions matched your search.
```

Keep wording consistent with the existing i18n system.

---

## 19. Search Result Row

Reuse the existing transaction list row/component where practical.

The Search page should visually remain consistent with Dashboard transaction records.

For example:

```text
Bills
MYR · Maybank · MasterCard
Electric Bill                -MYR 50
```

Do not create a completely different transaction visual design unless required.

Each search result should expose the same important information already shown for transactions, such as:

- Transaction description
- Account
- Category
- Currency
- Amount
- Relevant existing icons
- Attachment indicator if already supported by the shared transaction component

---

## 20. Result Interaction

Pressing a search result should navigate to the appropriate transaction detail page.

Reuse the existing transaction detail navigation.

Pass the transaction ID using the existing routing convention.

Do not create a separate "search transaction detail" page.

---

## 21. Search Score UI

`search_score` is internal implementation metadata.

Do NOT display values such as:

```text
Search Score: 80
```

to users.

It exists only for sorting.

---

## 22. Search History

Search history **must be supported**.

### Behaviour

Store recent successful search keywords locally.

A search keyword should be added to history when:

- The normalized keyword is not empty
- A search is actually executed
- Preferably after the user pauses typing / debounce completes or submits the search

Do not store empty strings.

Normalize the value before storing:

- Trim leading/trailing whitespace
- Treat case-insensitive duplicates as the same search

Example:

```text
Watsons
watsons
 WATSONS 
```

should be treated as one history item.

### Ordering

Recent searches should be ordered by most recently used first.

Example:

```text
Recent Searches

Watsons
Grab
Electric Bill
```

If an existing search term is searched again, move it to the top rather than inserting a duplicate.

### Maximum History

Keep a reasonable limit, for example:

```text
10 recent searches
```

Do not keep unlimited history.

### Persistence

Search history should persist across app restarts.

Use the project's existing local persistence approach if available.

If there is no existing suitable storage abstraction, use a lightweight local storage approach already available in the project.

Do not add a heavy new dependency only for search history.

### History UI

When the keyword is empty, show recent searches if available.

Each history item should be tappable.

Tapping a history item should:

1. Populate the search input
2. Execute the search
3. Move the selected item to the top of history

Provide a way to:

- Remove an individual history item
- Clear all recent searches

Use confirmation for "Clear all" only if consistent with Finora's existing UX conventions.

---

## 23. Filters

Search filters **must be supported**.

Add a filter action on the Search Transactions page.

Suggested placement:

```text
┌────────────────────────────────┐
│ 🔍 Search transactions...   × │
└────────────────────────────────┘

[ Filters ]
```

or a filter icon/button integrated near the search field.

Use existing Finora UI patterns.

### Required Filters

Support at least:

1. Date range
2. Account
3. Category
4. Transaction type
5. Currency
6. Amount range

Use existing entities and options already available in Finora.

Do not create duplicate master-data sources.

### Filter Behaviour

All filters are optional.

Filters must work:

- Together with a keyword
- Without a keyword

Examples:

```text
Keyword: bill
Account: Maybank
```

should search only matching Maybank transactions.

Another example:

```text
Keyword: empty
Category: Food
Date: 2026-08-01 → 2026-08-31
```

should return Food transactions within that date range.

### Multiple Filters

Applied filters should use AND logic between filter groups.

Conceptually:

```text
text matches
AND account matches
AND category matches
AND date matches
AND transaction type matches
AND currency matches
AND amount matches
```

The text search itself continues to use OR logic across:

```text
description OR category label OR account label
```

### Applied Filter Indication

The UI should clearly indicate when filters are active.

For example:

- Badge/count on filter icon
- Filter chips
- Active filter indicator

Do not rely on users remembering that hidden filters are active.

### Reset Filters

Provide an action to reset all filters.

Resetting filters should:

- Clear filter state
- Preserve the keyword unless the user separately clears it
- Reset pagination
- Re-run the search using the remaining keyword

### Filter State

Filter state only needs to remain while the Search page is open unless the existing navigation/state architecture already persists page state naturally.

Do not persist filters permanently across app restarts unless there is already an established product pattern for this.

---

## 24. Amount Search

Amount search **must be supported**.

Amount search should be handled separately from normal text `LIKE` matching.

### Numeric Keyword Detection

If the user enters a value that can be interpreted as an amount, such as:

```text
50
50.00
12.50
```

the search logic should include an amount condition.

Do not use:

```sql
CAST(amount AS TEXT) LIKE '%50%'
```

as the primary amount-search implementation.

Use numeric comparison.

### Exact Amount Matching

For a simple numeric keyword, support exact amount matching.

Conceptually:

```sql
amount = ?
```

Use the actual transaction amount field(s) defined in the current schema.

Inspect how Finora stores:

- Expense amounts
- Income amounts
- Transfers
- Currency-specific values
- Signed vs unsigned amounts

Do not assume the amount column or sign convention.

### Text + Amount Behaviour

If a keyword is numeric, amount matching may be combined with text matching where appropriate.

Example:

```text
Search: 50
```

may return:

- Transactions with amount exactly 50
- Transactions whose description/category/account contains "50", if such text matching is still logically supported

However, amount matches should be treated as strong matches.

Recommended approach:

```text
Exact amount match → high relevance
```

For example, assign an internal score higher than a weak text match, such as:

```text
Exact amount match +90
```

Do not display this score.

The final score should remain easy to understand and maintain.

### Amount Range Filter

The filter panel must also support:

```text
Minimum Amount
Maximum Amount
```

Examples:

```text
Min: 50
Max: 100
```

should return transactions whose relevant amount is between 50 and 100 inclusive.

Support:

- Minimum only
- Maximum only
- Both minimum and maximum

Validate that:

```text
minimum <= maximum
```

when both are entered.

### Currency Consideration

Do not compare different currencies as if they were the same amount unless Finora already has a clearly defined normalized/base-currency amount suitable for this purpose.

If transactions are stored in multiple currencies:

- Amount filter should operate on the transaction's relevant stored amount
- Currency filter can be used together with amount filter
- Do not silently convert currencies unless existing business logic already provides a canonical converted amount

Example:

```text
Currency: MYR
Amount: 50
```

should clearly mean MYR 50 transactions.

---

## 25. SQLite FTS

Do NOT introduce SQLite FTS/FTS5 for this implementation.

Use the verified `LIKE + CASE ranking` approach first.

FTS may be evaluated later if:

- Transaction volume becomes very large
- Search performance becomes poor
- More advanced full-text search is required

Do not add additional virtual tables, triggers, or FTS synchronization as part of this feature.

---

## 26. Performance

The current implementation can use:

```sql
LIKE '%keyword%'
```

because Finora is a local personal accounting application.

However:

- Always paginate
- Do not load all results at once
- Debounce UI searches
- Keep DB logic outside rendering loops
- Avoid executing duplicate searches for the same criteria/page
- Avoid rebuilding filter option lists unnecessarily
- Parameterize all values

Do not add premature complex indexing or FTS unless required by measured performance.

---

## 27. Race Condition Handling

Because search is asynchronous and debounced, protect against stale responses.

Example:

User types:

```text
b
bi
bil
bill
```

A slower query for:

```text
bi
```

must not overwrite a newer result for:

```text
bill
```

The same applies when filters change quickly.

Use the existing project patterns if available.

Possible solutions include:

- Request/search sequence ID
- Current criteria comparison before applying results
- Cancellation if supported by the existing architecture

Do not allow stale search results to replace newer ones.

---

## 28. Keyboard UX

On the Search page:

- Autofocus the search field
- Search keyboard should be appropriate for text search
- User should be able to dismiss the keyboard
- Scrolling the results should behave naturally
- Tapping a result should work even if the keyboard is currently displayed
- Avoid keyboard covering important result content

Follow existing React Native / Expo keyboard handling conventions in Finora.

---

## 29. i18n

All new user-facing strings must use Finora's existing i18n solution.

Do not hard-code English UI text directly into components if the application already uses translation keys.

Potential strings include:

```text
Search Transactions
Search transactions...
Search your transactions
Search by description, category, account, or amount.
Recent Searches
Clear All
Filters
Reset Filters
Apply Filters
No transactions found
Minimum Amount
Maximum Amount
```

Follow existing translation-key naming conventions.

---

## 33. Acceptance Criteria

The implementation is complete when all of the following are satisfied.

### Navigation

- [ ] Search icon is available from Dashboard
- [ ] Pressing search opens the dedicated Search Transactions page
- [ ] Search is not added to bottom navigation
- [ ] Search page can navigate back normally

### Text Search

- [ ] User can enter a keyword
- [ ] Search ignores leading/trailing whitespace
- [ ] Search is case-insensitive
- [ ] Description supports exact matching
- [ ] Description supports starts-with matching
- [ ] Description supports contains matching
- [ ] Category label can be searched
- [ ] Account label can be searched

### Ranking

- [ ] Exact description match scores 100
- [ ] Description starts-with match scores 80
- [ ] Description contains match scores 60
- [ ] Category match adds 20
- [ ] Account match adds 10
- [ ] Scores are additive
- [ ] Amount exact matches receive strong relevance
- [ ] Results are ordered by relevance when text/amount search is active
- [ ] Equal-score results are ordered by most recent transaction

### Search History

- [ ] Recent successful search keywords are stored locally
- [ ] Search history persists across app restarts
- [ ] History is ordered by most recently used
- [ ] Duplicate searches are merged case-insensitively
- [ ] Re-searching an existing item moves it to the top
- [ ] History has a maximum size
- [ ] User can tap a recent search to run it again
- [ ] User can remove an individual history item
- [ ] User can clear all history

### Filters

- [ ] Date range filter is supported
- [ ] Account filter is supported
- [ ] Category filter is supported
- [ ] Transaction type filter is supported
- [ ] Currency filter is supported
- [ ] Amount range filter is supported
- [ ] Filters work together with a keyword
- [ ] Filters work without a keyword
- [ ] Multiple filters use AND logic
- [ ] Active filters are visibly indicated
- [ ] User can reset all filters
- [ ] Changing filters resets pagination

### Amount Search

- [ ] Numeric keywords are detected safely
- [ ] Exact numeric amount matching is supported
- [ ] Amount search uses numeric comparison rather than text LIKE
- [ ] Minimum amount filter works
- [ ] Maximum amount filter works
- [ ] Combined min/max range works
- [ ] Invalid min/max ranges are handled
- [ ] Currency semantics are respected
- [ ] No unrequested currency conversion is introduced

### Scope

- [ ] Search works across all transaction history
- [ ] Dashboard date range does not restrict global search
- [ ] Search does not return Accounts/Categories as standalone entities
- [ ] No FTS implementation is introduced

### Database

- [ ] SQL uses parameter binding
- [ ] No user search/filter text is interpolated directly into SQL
- [ ] NULL category/account labels are handled safely
- [ ] Search supports LIMIT/OFFSET pagination
- [ ] Existing schema/amount conventions are inspected rather than guessed

### UI

- [ ] Search input autofocuses
- [ ] Input can be cleared
- [ ] Search is debounced
- [ ] Initial loading state exists
- [ ] Pagination loading state exists
- [ ] Empty state exists
- [ ] No-result state exists
- [ ] Existing transaction UI is reused where practical
- [ ] Search score is not displayed to the user
- [ ] Search history is visible when appropriate
- [ ] Filter UI is consistent with existing Finora patterns

### Interaction

- [ ] Tapping a result opens the existing transaction detail page
- [ ] A new keyword resets pagination/results
- [ ] Filter changes reset pagination/results
- [ ] Old asynchronous searches cannot override newer search criteria

### Code Quality

- [ ] Existing architecture and naming conventions are followed
- [ ] Existing theme is reused
- [ ] Existing i18n implementation is reused
- [ ] Existing pagination utilities/constants are reused where appropriate
- [ ] No unnecessary library is introduced
- [ ] No unrelated refactoring is performed

---

## 34. Important Implementation Instruction

Before modifying code:

1. Inspect the current Dashboard implementation.
2. Inspect the existing transaction list component.
3. Inspect existing transaction detail navigation.
4. Inspect the SQLite transaction repository/query layer.
5. Inspect existing pagination implementation.
6. Inspect existing local persistence/storage utilities for search history.
7. Inspect existing filter/select/date-range UI patterns.
8. Inspect the current transaction schema and determine the actual amount field(s), currency handling, transaction type representation, and date field.
9. Inspect existing theme/i18n conventions.
10. Reuse existing utilities/components wherever possible.

Do not assume field names that are not verified from the existing schema.

Known verified searchable fields are:

```text
transactions.descriptions
categories.label
accounts.label
```

The SQL provided above has already been successfully executed against the current database and should be treated as the reference behavior for text ranking.

Implement the smallest clean change that satisfies this requirement without introducing unnecessary architectural changes.
