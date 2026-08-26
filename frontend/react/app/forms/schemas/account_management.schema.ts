import { z } from "zod";
import { AMOUNT_MAX_LENGTH, AMOUNT_PATTERN } from "../../utils/amount";
import {
  CURRENCY_CODES,
  DEFAULT_CURRENCY_CODE,
} from "../../constants/currencies";

export type AccountManagementFormType = z.infer<
  typeof accountManagementFormSchema
>;

export const LABEL_MAX_LEN = 30;
export const DESCRIPTION_MAX_LEN = 100;
export const CURRENT_BALANCE_MAX_LEN = AMOUNT_MAX_LENGTH;

export const accountManagementFormSchema = z.object({
  typeId: z.string().min(1, "Please select a type"),
  currencyCode: z
    .string()
    .refine((value) => CURRENCY_CODES.has(value), "Please select a currency"),
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
  currentBalance: z
    .string()
    .optional()
    .refine((value) => !value || AMOUNT_PATTERN.test(value), {
      message: "Maximum 13 integer digits and 2 decimal places",
    }),
  isMainAccount: z.boolean(),
});

export const accountManagementFormDefaultValues: AccountManagementFormType = {
  typeId: "",
  currencyCode: DEFAULT_CURRENCY_CODE,
  label: "",
  descriptions: "",
  currentBalance: "0.00",
  isMainAccount: true,
};
