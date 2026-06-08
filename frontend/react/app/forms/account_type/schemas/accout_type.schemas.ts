import { z } from "zod";

export type AccountTypeFormType = z.infer<typeof accountTypeFormSchema>;

export const accountTypeFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Please enter account type label")
    .max(20, "Label must be less than 20 characters"),
  icon: z.string().trim(),
});

export const accountTypeFormDefaultValues: AccountTypeFormType = {
  label: "",
  icon: "",
};
