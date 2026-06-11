import { z } from "zod";

export type AccountManagementFormType = z.infer<
  typeof accountManagementFormSchema
>;

export const LABEL_MAX_LEN = 30;
export const DESCRIPTION_MAX_LEN = 100;

export const accountManagementFormSchema = z.object({
  typeId: z.number().min(1, "Please select a type"),
  label: z
    .string()
    .trim()
    .min(1, "Please select account type label")
    .max(LABEL_MAX_LEN, `Label must be less than ${LABEL_MAX_LEN} characters`),
  descriptions: z
    .string()
    .trim()
    .max(
      DESCRIPTION_MAX_LEN,
      `Description must be less than ${DESCRIPTION_MAX_LEN} characters`,
    )
    .optional(),
  initialValue: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{1,10}(\.\d{1,2})?$/.test(value), {
      message: "Maximum 10 integer digits and 2 decimal places",
    }),
  isMainAccount: z.boolean(),
});

export const accountManagementFormDefaultValues: AccountManagementFormType = {
  typeId: 0,
  label: "",
  descriptions: "",
  initialValue: "",
  isMainAccount: true,
};
