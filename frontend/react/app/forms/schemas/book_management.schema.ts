import { z } from "zod";
import { DEFAULT_BOOK_ICON } from "../../utils/book";
import type { AppIconProps } from "../../components/AppIcon";

export const LABEL_MAX_LEN = 30;
export const DESCRIPTION_MAX_LEN = 100;

export const bookManagementSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Book label is required")
    .max(LABEL_MAX_LEN, `Label must not exceed ${LABEL_MAX_LEN} characters`),
  description: z
    .string()
    .trim()
    .max(
      DESCRIPTION_MAX_LEN,
      `Description must not exceed ${DESCRIPTION_MAX_LEN} characters`,
    )
    .optional(),
  icon: z.custom<AppIconProps["name"]>(
    (value) => typeof value === "string" && value.length > 0,
    "Please select an icon",
  ),
});

export type BookManagementFormType = z.infer<typeof bookManagementSchema>;

export const BOOK_MANAGEMENT_DEFAULT_VALUES: BookManagementFormType = {
  label: "",
  description: "",
  icon: DEFAULT_BOOK_ICON,
};
