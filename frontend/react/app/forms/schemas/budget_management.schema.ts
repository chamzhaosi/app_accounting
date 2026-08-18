import { z } from "zod";

const amountPattern = /^\d{1,8}(\.\d{0,2})?$/;

export const budgetManagementFormSchema = z.object({
  totalBudget: z
    .string()
    .trim()
    .min(1, "Please enter a total budget")
    .regex(amountPattern, "Enter a valid amount with up to 2 decimal places")
    .refine((value) => Number(value) > 0, "Total budget must be above zero"),
  isActive: z.boolean(),
});

export type BudgetManagementFormType = z.infer<
  typeof budgetManagementFormSchema
>;

export const budgetManagementFormDefaultValues: BudgetManagementFormType = {
  totalBudget: "0.00",
  isActive: true,
};
