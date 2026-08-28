import { z } from "zod";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import {
  AMOUNT_MAX_LENGTH,
  compareAmounts,
  isValidAmount,
} from "../../utils/amount";
import { getCurrencyDecimalDigits } from "../../constants/currencies";
import { EXCHANGE_RATE_ZERO } from "../../utils/exchangeRate";

export const DESCRIPTION_MAX_LEN = 100;
export const AMOUNT_MAX_LEN = AMOUNT_MAX_LENGTH;
export const TRANSACTION_DATE_MAX_LEN = 10;
export const EXCHANGE_RATE_MAX_LEN = 20;
export const EXCHANGE_RATE_PATTERN = /^\d{1,13}(?:\.\d{1,6})?$/;

const positiveAmountSchema = (requiredMessage: string) =>
  z
    .string()
    .min(1, requiredMessage)
    .refine((value) => {
      try {
        return compareAmounts(value, 0) > 0;
      } catch {
        return false;
      }
    }, requiredMessage);

const transactionFeeSchema = z.object({
  accountId: z.string(),
  amount: positiveAmountSchema("Fee amount must be greater than zero"),
  categoryId: z.string().min(1, "Please select a fee category"),
});

export const transactionManagementFormSchema = z
  .object({
    transactionType: z.enum(TXN_TYPE_ENUM),
    categoryId: z.string(),
    accountId: z.string(),
    fromAccountId: z.string(),
    toAccountId: z.string(),
    currencyCode: z.string(),
    accountCurrencyCode: z.string(),
    convertedAmount: z.string(),
    exchangeRate: z.string(),
    exchangeRateSource: z.enum(["manual", "previous", "inverse"]).optional(),
    exchangeRateSourceTransactionId: z.string().optional(),
    fees: z.array(transactionFeeSchema),
    description: z
      .string()
      .trim()
      .max(
        DESCRIPTION_MAX_LEN,
        `Description must not exceed ${DESCRIPTION_MAX_LEN} characters`,
      )
      .optional(),
    amount: positiveAmountSchema(
      "Transaction amount must be greater than zero",
    ),
    transactionDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use date format YYYY-MM-DD")
      .refine((value) => {
        const parsedDate = new Date(`${value}T00:00:00`);
        return (
          !Number.isNaN(parsedDate.getTime()) &&
          parsedDate.getFullYear() === Number(value.slice(0, 4)) &&
          parsedDate.getMonth() + 1 === Number(value.slice(5, 7)) &&
          parsedDate.getDate() === Number(value.slice(8, 10))
        );
      }, "Please enter a valid transaction date"),
  })
  .superRefine(
    (
      {
        transactionType,
        categoryId,
        accountId,
        fromAccountId,
        toAccountId,
        currencyCode,
        accountCurrencyCode,
        convertedAmount,
        exchangeRate,
        amount,
        fees,
      },
      context,
    ) => {
      if (!currencyCode) {
        context.addIssue({
          code: "custom",
          path: ["currencyCode"],
          message: "Please select a transaction currency",
        });
      }
      if (!accountCurrencyCode) {
        context.addIssue({
          code: "custom",
          path: ["accountCurrencyCode"],
          message: "Please select an account",
        });
      }

      if (currencyCode && accountCurrencyCode) {
        if (!isValidAmount(amount, currencyCode)) {
          context.addIssue({
            code: "custom",
            path: ["amount"],
            message: `Maximum 13 integer digits and ${getCurrencyDecimalDigits(currencyCode)} decimal places`,
          });
        }

        if (
          !convertedAmount ||
          !isValidAmount(convertedAmount, accountCurrencyCode)
        ) {
          context.addIssue({
            code: "custom",
            path: ["convertedAmount"],
            message: `Maximum 13 integer digits and ${getCurrencyDecimalDigits(accountCurrencyCode)} decimal places`,
          });
        } else if (compareAmounts(convertedAmount, 0) <= 0) {
          context.addIssue({
            code: "custom",
            path: ["convertedAmount"],
            message: "Account amount must be greater than zero",
          });
        }

        const feeCurrencyCode =
          transactionType === TXN_TYPE_ENUM.TRANSFER
            ? currencyCode
            : accountCurrencyCode;
        fees.forEach((fee, index) => {
          if (!isValidAmount(fee.amount, feeCurrencyCode)) {
            context.addIssue({
              code: "custom",
              path: ["fees", index, "amount"],
              message: `Maximum 13 integer digits and ${getCurrencyDecimalDigits(feeCurrencyCode)} decimal places`,
            });
          }
        });

        if (
          currencyCode !== accountCurrencyCode &&
          (!EXCHANGE_RATE_PATTERN.test(exchangeRate) ||
            Number(exchangeRate) <= 0)
        ) {
          context.addIssue({
            code: "custom",
            path: ["exchangeRate"],
            message: "Enter an exchange rate with up to 6 decimal places",
          });
        }
      }

      if (transactionType === "transfer") {
        if (!fromAccountId) {
          context.addIssue({
            code: "custom",
            path: ["fromAccountId"],
            message: "Please select a From Account",
          });
        }

        if (!toAccountId) {
          context.addIssue({
            code: "custom",
            path: ["toAccountId"],
            message: "Please select a To Account",
          });
        }

        if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
          context.addIssue({
            code: "custom",
            path: ["toAccountId"],
            message: "From and To Accounts must be different",
          });
        }

        return;
      }

      if (!accountId) {
        context.addIssue({
          code: "custom",
          path: ["accountId"],
          message: "Please select an account",
        });
      }

      if (!categoryId) {
        context.addIssue({
          code: "custom",
          path: ["categoryId"],
          message: "Please select a category",
        });
      }
    },
  );

export type TransactionManagementFormType = z.infer<
  typeof transactionManagementFormSchema
>;

export const getTransactionManagementFormDefaultValues = (
  transactionDate: string,
): TransactionManagementFormType => ({
  transactionType: TXN_TYPE_ENUM.EXPENSE,
  categoryId: "",
  accountId: "",
  fromAccountId: "",
  toAccountId: "",
  currencyCode: "",
  accountCurrencyCode: "",
  convertedAmount: "0",
  exchangeRate: EXCHANGE_RATE_ZERO,
  exchangeRateSource: undefined,
  exchangeRateSourceTransactionId: "",
  fees: [],
  description: "",
  amount: "0.00",
  transactionDate,
});
