import { z } from "zod";
import {
  AMOUNT_MAX_LENGTH,
  compareAmounts,
  isValidAmount,
} from "../../utils/amount";
import {
  CURRENCY_CODES,
  DEFAULT_CURRENCY_CODE,
} from "../../constants/currencies";
import { getCurrentCreditCardCycleDates } from "../../utils/creditCardCycle";

export type AccountManagementFormType = z.infer<
  typeof accountManagementFormSchema
>;

export const LABEL_MAX_LEN = 30;
export const DESCRIPTION_MAX_LEN = 100;
export const CURRENT_BALANCE_MAX_LEN = AMOUNT_MAX_LENGTH;

export const accountManagementFormSchema = z
  .object({
    typeId: z.string().min(1, "Please select a type"),
    currencyCode: z
      .string()
      .refine((value) => CURRENCY_CODES.has(value), "Please select a currency"),
    label: z
      .string()
      .trim()
      .min(1, "Please select account type label")
      .max(
        LABEL_MAX_LEN,
        `Label must be less than ${LABEL_MAX_LEN} characters`,
      ),
    descriptions: z
      .string()
      .trim()
      .max(
        DESCRIPTION_MAX_LEN,
        `Description must be less than ${DESCRIPTION_MAX_LEN} characters`,
      )
      .optional(),
    currentBalance: z.string().optional(),
    balancePosition: z.enum(["debt", "overpayment"]),
    reminderEnabled: z.boolean(),
    statementDay: z.string(),
    dueDay: z.string(),
    reminderLeadDays: z.string(),
    reminderTime: z.string(),
    reminderStopCondition: z.enum(["full", "minimum"]),
    firstCycleMode: z.enum(["current", "next"]),
    currentCycleRemainingDue: z.string().optional(),
    currentCycleDueDate: z.string().optional(),
    isActive: z.boolean(),
    isAsset: z.boolean(),
  })
  .superRefine((value, context) => {
    const { currencyCode, currentBalance } = value;
    if (currentBalance && !isValidAmount(currentBalance, currencyCode)) {
      context.addIssue({
        code: "custom",
        path: ["currentBalance"],
        message: "Enter an amount using the currency's decimal precision",
      });
    }
    if (!value.reminderEnabled) return;
    const dayFields = [
      ["statementDay", value.statementDay, 31],
      ["dueDay", value.dueDay, 31],
      ["reminderLeadDays", value.reminderLeadDays, 10],
    ] as const;
    dayFields.forEach(([path, raw, maximum]) => {
      const day = Number(raw);
      if (!Number.isInteger(day) || day < 1 || day > maximum) {
        context.addIssue({
          code: "custom",
          path: [path],
          message: `Select a value from 1 to ${maximum}`,
        });
      }
    });
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value.reminderTime)) {
      context.addIssue({
        code: "custom",
        path: ["reminderTime"],
        message: "Enter time as HH:mm",
      });
    }
    if (value.firstCycleMode === "current") {
      const isAmountDueValid = Boolean(
        value.currentCycleRemainingDue &&
        isValidAmount(value.currentCycleRemainingDue, currencyCode),
      );
      if (!isAmountDueValid) {
        context.addIssue({
          code: "custom",
          path: ["currentCycleRemainingDue"],
          message: "Enter the remaining statement amount",
        });
      } else if (
        value.balancePosition === "overpayment" &&
        compareAmounts(value.currentCycleRemainingDue, 0) > 0
      ) {
        context.addIssue({
          code: "custom",
          path: ["currentCycleRemainingDue"],
          message: "Amount due must be zero for an overpaid card",
        });
      } else if (
        value.balancePosition === "debt" &&
        currentBalance &&
        isValidAmount(currentBalance, currencyCode) &&
        compareAmounts(value.currentCycleRemainingDue, currentBalance) > 0
      ) {
        context.addIssue({
          code: "custom",
          path: ["currentCycleRemainingDue"],
          message: "Amount due cannot exceed the current debt balance",
        });
      }
      const expectedDueDate = getCurrentCreditCardCycleDates(
        Number(value.statementDay),
        Number(value.dueDay),
      )?.dueDate;
      if (!expectedDueDate || value.currentCycleDueDate !== expectedDueDate) {
        context.addIssue({
          code: "custom",
          path: ["currentCycleDueDate"],
          message: "Due date must match the configured due day",
        });
      }
    }
  });

export const accountManagementFormDefaultValues: AccountManagementFormType = {
  typeId: "",
  currencyCode: DEFAULT_CURRENCY_CODE,
  label: "",
  descriptions: "",
  currentBalance: "0",
  balancePosition: "debt",
  reminderEnabled: false,
  statementDay: "20",
  dueDay: "28",
  reminderLeadDays: "3",
  reminderTime: "09:00",
  reminderStopCondition: "full",
  firstCycleMode: "next",
  currentCycleRemainingDue: "0",
  currentCycleDueDate: "",
  isActive: true,
  isAsset: true,
};
