import { z } from "zod";

export type AccountTypeFormType = z.infer<typeof accountTypeFormSchema>;

export const LABEL_MAX_LEN = 30;

export const accountTypeFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Please enter account type label")
    .max(LABEL_MAX_LEN, "Label must be less than 30 characters"),
  icon: z.string().trim(),
});

export const accountTypeFormDefaultValues: AccountTypeFormType = {
  label: "",
  icon: "",
};
