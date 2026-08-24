import { z } from "zod";
import { AMOUNT_PATTERN, compareAmounts } from "../../utils/amount";

export const budgetManagementFormSchema = z.object({
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
  totalBudget: "0.00",
  isActive: true,
};
