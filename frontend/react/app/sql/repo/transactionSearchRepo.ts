import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getDB } from "../db/database";
import type {
  TransactionSearchFilterOptions,
  TransactionSearchRequest,
  TransactionSearchRspType,
} from "../types/transactionSearchType";

const TRANSACTION_SEARCH_FROM = `
  FROM transactions
  LEFT JOIN categories
    ON categories.id = transactions.category_id
  LEFT JOIN accounts
    ON accounts.id = transactions.account_id
  LEFT JOIN accounts AS from_accounts
    ON from_accounts.id = transactions.from_account_id
  LEFT JOIN accounts AS to_accounts
    ON to_accounts.id = transactions.to_account_id
`;

const DESCRIPTION_VALUE = "LOWER(COALESCE(transactions.descriptions, ''))";
const CATEGORY_VALUE = "LOWER(COALESCE(categories.label, ''))";
const ACCOUNT_MATCH = `(
  LOWER(COALESCE(accounts.label, '')) LIKE LOWER(?)
  OR LOWER(COALESCE(from_accounts.label, '')) LIKE LOWER(?)
  OR LOWER(COALESCE(to_accounts.label, '')) LIKE LOWER(?)
)`;

const buildPlaceholders = (values: readonly unknown[]) =>
  values.map(() => "?").join(", ");

const buildAmountMatch = (
  amount: number,
  currencyCodes: string[] | undefined,
  params: Array<string | number>,
) => {
  if (currencyCodes?.length) {
    const placeholders = buildPlaceholders(currencyCodes);
    params.push(...currencyCodes, amount, ...currencyCodes, amount);
    return `(
      (
        transactions.currency_code IN (${placeholders})
        AND ABS(transactions.amount) = ?
      )
      OR (
        transactions.account_currency_code IN (${placeholders})
        AND ABS(transactions.converted_amount) = ?
      )
    )`;
  }

  params.push(amount, amount);
  return `(
    ABS(transactions.amount) = ?
    OR ABS(transactions.converted_amount) = ?
  )`;
};

export const searchTransactionsFromDB = async ({
  keyword,
  numericKeyword,
  filters,
  curPage,
  pageSize,
}: TransactionSearchRequest): Promise<TransactionSearchRspType[]> => {
  try {
    const db = await getDB();
    const offset = (curPage - 1) * pageSize;
    const scoreParams: Array<string | number> = [];
    const whereParams: Array<string | number> = [];
    const filterParams: Array<string | number> = [];
    const scoreParts: string[] = [];
    const keywordMatches: string[] = [];
    const filtersSql: string[] = ["transactions.deleted_at IS NULL"];

    if (keyword) {
      const startsWith = `${keyword}%`;
      const contains = `%${keyword}%`;
      scoreParts.push(`
        CASE
          WHEN ${DESCRIPTION_VALUE} = LOWER(?) THEN 100
          WHEN ${DESCRIPTION_VALUE} LIKE LOWER(?) THEN 80
          WHEN ${DESCRIPTION_VALUE} LIKE LOWER(?) THEN 60
          ELSE 0
        END
      `);
      scoreParams.push(keyword, startsWith, contains);
      scoreParts.push(
        `CASE WHEN ${CATEGORY_VALUE} LIKE LOWER(?) THEN 20 ELSE 0 END`,
      );
      scoreParams.push(contains);
      scoreParts.push(`CASE WHEN ${ACCOUNT_MATCH} THEN 10 ELSE 0 END`);
      scoreParams.push(contains, contains, contains);

      keywordMatches.push(`${DESCRIPTION_VALUE} LIKE LOWER(?)`);
      whereParams.push(contains);
      keywordMatches.push(`${CATEGORY_VALUE} LIKE LOWER(?)`);
      whereParams.push(contains);
      keywordMatches.push(ACCOUNT_MATCH);
      whereParams.push(contains, contains, contains);
    }

    if (numericKeyword !== undefined) {
      const amountScoreParams: Array<string | number> = [];
      const amountWhereParams: Array<string | number> = [];
      const scoreMatch = buildAmountMatch(
        numericKeyword,
        filters.currencyCodes,
        amountScoreParams,
      );
      const whereMatch = buildAmountMatch(
        numericKeyword,
        filters.currencyCodes,
        amountWhereParams,
      );
      scoreParts.push(`CASE WHEN ${scoreMatch} THEN 90 ELSE 0 END`);
      scoreParams.push(...amountScoreParams);
      keywordMatches.push(whereMatch);
      whereParams.push(...amountWhereParams);
    }

    if (keywordMatches.length) {
      filtersSql.push(`(${keywordMatches.join(" OR ")})`);
    }

    if (filters.startDate) {
      filtersSql.push("transactions.transaction_date >= ?");
      filterParams.push(filters.startDate);
    }
    if (filters.endDate) {
      filtersSql.push("transactions.transaction_date <= ?");
      filterParams.push(filters.endDate);
    }
    if (filters.accountIds?.length) {
      const placeholders = buildPlaceholders(filters.accountIds);
      filtersSql.push(`(
        transactions.account_id IN (${placeholders})
        OR transactions.from_account_id IN (${placeholders})
        OR transactions.to_account_id IN (${placeholders})
      )`);
      filterParams.push(
        ...filters.accountIds,
        ...filters.accountIds,
        ...filters.accountIds,
      );
    }
    if (filters.categoryIds?.length) {
      filtersSql.push(
        `transactions.category_id IN (${buildPlaceholders(filters.categoryIds)})`,
      );
      filterParams.push(...filters.categoryIds);
    }
    if (filters.transactionTypes?.length) {
      filtersSql.push(
        `transactions.transaction_type IN (${buildPlaceholders(
          filters.transactionTypes,
        )})`,
      );
      filterParams.push(...filters.transactionTypes);
    }

    const hasMinimum = filters.minimumAmount !== undefined;
    const hasMaximum = filters.maximumAmount !== undefined;
    if (hasMinimum || hasMaximum) {
      const amountConditions = (
        amountColumn: string,
        currencyColumn: string,
      ) => {
        const parts: string[] = [];
        if (filters.currencyCodes?.length) {
          parts.push(
            `${currencyColumn} IN (${buildPlaceholders(filters.currencyCodes)})`,
          );
          filterParams.push(...filters.currencyCodes);
        }
        if (hasMinimum) {
          parts.push(`ABS(${amountColumn}) >= ?`);
          filterParams.push(Number(filters.minimumAmount));
        }
        if (hasMaximum) {
          parts.push(`ABS(${amountColumn}) <= ?`);
          filterParams.push(Number(filters.maximumAmount));
        }
        return `(${parts.join(" AND ")})`;
      };
      filtersSql.push(`(
        ${amountConditions("transactions.amount", "transactions.currency_code")}
        OR ${amountConditions(
          "transactions.converted_amount",
          "transactions.account_currency_code",
        )}
      )`);
    } else if (filters.currencyCodes?.length) {
      const placeholders = buildPlaceholders(filters.currencyCodes);
      filtersSql.push(`(
        transactions.currency_code IN (${placeholders})
        OR transactions.account_currency_code IN (${placeholders})
      )`);
      filterParams.push(...filters.currencyCodes, ...filters.currencyCodes);
    }

    const searchScore = scoreParts.length ? scoreParts.join(" + ") : "0";
    const result = await db.getAllAsync<TransactionSearchRspType>(
      `
        SELECT
          transactions.*,
          categories.label AS category_label,
          categories.translation_key AS category_translation_key,
          categories.icon AS category_icon,
          accounts.label AS account_label,
          from_accounts.label AS from_account_label,
          to_accounts.label AS to_account_label,
          EXISTS (
            SELECT 1
            FROM transaction_attachments
            WHERE transaction_attachments.transaction_id = transactions.id
          ) AS has_attachments,
          (${searchScore}) AS search_score
        ${TRANSACTION_SEARCH_FROM}
        WHERE ${filtersSql.join(" AND ")}
        ORDER BY
          ${scoreParts.length ? "search_score DESC," : ""}
          transaction_date DESC,
          created_at DESC
        LIMIT ? OFFSET ?;
      `,
      [...scoreParams, ...whereParams, ...filterParams, pageSize, offset],
    );

    debugLog(
      DEBUG_TAG.TRANSACTION_SEARCH_DB,
      "Loaded transaction search page",
      {
        keyword,
        filters,
        curPage,
        pageSize,
        count: result.length,
      },
    );
    return result;
  } catch (error) {
    console.error(
      DEBUG_TAG.TRANSACTION_SEARCH_DB,
      "Error when searching transactions",
      error,
    );
    throw error;
  }
};

export const getTransactionSearchFilterOptionsFromDB =
  async (): Promise<TransactionSearchFilterOptions> => {
    try {
      const db = await getDB();
      const [accounts, categories, currencies] = await Promise.all([
        db.getAllAsync<{
          id: string;
          icon: string;
          label: string;
          currency_code: string;
          current_balance: number;
          descriptions: string | null;
          type_id: string;
          type_label: string;
        }>(
          `SELECT
             accounts.id,
             account_types.icon,
             accounts.label,
             accounts.currency_code,
             accounts.current_balance,
             accounts.descriptions,
             accounts.type_id,
             account_types.label AS type_label
         FROM accounts
         INNER JOIN account_types ON account_types.id = accounts.type_id
         WHERE accounts.deleted_at IS NULL
         ORDER BY account_types.label COLLATE NOCASE ASC,
                  accounts.label COLLATE NOCASE ASC;`,
        ),
        db.getAllAsync<{
          id: string;
          icon: string;
          label: string;
          type_id: number;
          translation_key: string | null;
        }>(
          `SELECT id, icon, label, type_id, translation_key
         FROM categories
         WHERE deleted_at IS NULL
         ORDER BY type_id ASC, label COLLATE NOCASE ASC;`,
        ),
        db.getAllAsync<{ code: string }>(
          `SELECT code
         FROM (
           SELECT currency_code AS code
           FROM transactions
           WHERE deleted_at IS NULL
           UNION
           SELECT account_currency_code AS code
           FROM transactions
           WHERE deleted_at IS NULL
         )
         ORDER BY code ASC;`,
        ),
      ]);

      return {
        accounts: accounts.map(
          ({
            id,
            icon,
            label,
            currency_code,
            current_balance,
            descriptions,
            type_id,
            type_label,
          }) => ({
            id,
            icon,
            label,
            currencyCode: currency_code,
            currentBalance: current_balance,
            description: descriptions,
            typeId: type_id,
            typeLabel: type_label,
          }),
        ),
        categories: categories.map(
          ({ id, icon, label, type_id, translation_key }) => ({
            id,
            icon,
            label,
            typeId: type_id,
            translationKey: translation_key,
          }),
        ),
        currencyCodes: currencies.map(({ code }) => code),
      };
    } catch (error) {
      console.error(
        DEBUG_TAG.TRANSACTION_SEARCH_DB,
        "Error when loading transaction search filters",
        error,
      );
      throw error;
    }
  };
