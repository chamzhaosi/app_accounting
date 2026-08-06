import { z } from "zod";

export const DESCRIPTION_MAX_LEN = 100;
export const AMOUNT_MAX_LEN = 13;
export const TRANSACTION_DATE_MAX_LEN = 10;

export const transactionManagementFormSchema = z
  .object({
    transactionType: z.enum(["expense", "income", "transfer"]),
    categoryId: z.string(),
    accountId: z.string(),
    fromAccountId: z.string(),
    toAccountId: z.string(),
    description: z
      .string()
      .trim()
      .max(
        DESCRIPTION_MAX_LEN,
        `Description must not exceed ${DESCRIPTION_MAX_LEN} characters`,
      )
      .optional(),
    amount: z
      .string()
      .min(1, "Please enter a transaction amount")
      .refine((value) => /^\d{1,10}(\.\d{1,2})?$/.test(value), {
        message: "Maximum 10 integer digits and 2 decimal places",
      })
      .refine((value) => Number(value) > 0, {
        message: "Transaction amount must be greater than zero",
      }),
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
      { transactionType, categoryId, accountId, fromAccountId, toAccountId },
      context,
    ) => {
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
  transactionType: "expense",
  categoryId: "",
  accountId: "",
  fromAccountId: "",
  toAccountId: "",
  description: "",
  amount: "",
  transactionDate,
});
