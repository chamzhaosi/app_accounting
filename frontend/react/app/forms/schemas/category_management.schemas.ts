import { z } from "zod";

export type CategoryManagementFormType = z.infer<
  typeof categoryManagementFormSchema
>;

export const LABEL_MAX_LEN = 30;
export const DESCRIPTION_MAX_LEN = 100;

export const categoryManagementFormSchema = z.object({
  typeId: z.number().min(1, "Please select a type"),
  icon: z.string().trim().min(1, "Please select a icon"),
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
});

export const categoryManagementFormDefaultValues: CategoryManagementFormType = {
  typeId: 0,
  label: "",
  icon: "",
  descriptions: "",
};
