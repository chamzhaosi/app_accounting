import { z } from "zod";
import { AMOUNT_PATTERN, compareAmounts } from "../../utils/amount";
import {
  CURRENCY_CODES,
  DEFAULT_CURRENCY_CODE,
} from "../../constants/currencies";

export const budgetManagementFormSchema = z.object({
  currencyCode: z
    .string()
    .refine((value) => CURRENCY_CODES.has(value), "Please select a currency"),
  totalBudget: z
    .string()
    .trim()
    .min(1, "Please enter a total budget")
    .regex(AMOUNT_PATTERN, "Enter a valid amount with up to 2 decimal places")
    .refine(
      (value) => compareAmounts(value, 0) > 0,
      "Total budget must be above zero",
    ),
  isActive: z.boolean(),
});

export type BudgetManagementFormType = z.infer<
  typeof budgetManagementFormSchema
>;

export const budgetManagementFormDefaultValues: BudgetManagementFormType = {
  currencyCode: DEFAULT_CURRENCY_CODE,
  totalBudget: "0.00",
  isActive: true,
};
