import { z } from "zod";
import { compareAmounts, isValidAmount } from "../../utils/amount";
import {
  CURRENCY_CODES,
  DEFAULT_CURRENCY_CODE,
} from "../../constants/currencies";

export const budgetManagementFormSchema = z
  .object({
    currencyCode: z
      .string()
      .refine((value) => CURRENCY_CODES.has(value), "Please select a currency"),
    totalBudget: z
      .string()
      .trim()
      .min(1, "Please enter a total budget")
      .refine((value) => {
        try {
          return compareAmounts(value, 0) > 0;
        } catch {
          return false;
        }
      }, "Total budget must be above zero"),
    isActive: z.boolean(),
  })
  .superRefine(({ currencyCode, totalBudget }, context) => {
    if (currencyCode && !isValidAmount(totalBudget, currencyCode)) {
      context.addIssue({
        code: "custom",
        path: ["totalBudget"],
        message: "Enter an amount using the currency's decimal precision",
      });
    }
  });

export type BudgetManagementFormType = z.infer<
  typeof budgetManagementFormSchema
>;

export const budgetManagementFormDefaultValues: BudgetManagementFormType = {
  currencyCode: DEFAULT_CURRENCY_CODE,
  totalBudget: "0",
  isActive: true,
};
