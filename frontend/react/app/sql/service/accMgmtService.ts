import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { CURRENCY_CODES } from "../../constants/currencies";
import {
  compareAmounts,
  isValidAmount,
  subtractAmounts,
} from "../../utils/amount";
import {
  createNewAccMgmtToDB,
  deleteAccMgmtFromDB,
  getAccountTypeBalanceTotalsFromDB,
  getAccMgmtByIdFromDB,
  getAccMgmtByTypeCurrencyAndLabelFromDB,
  getAccMgmtListFromDB,
  getAssetBalanceFromDB,
  updateAccMgmtToDB,
} from "../repo/accMgmtRepo";
import { getCategoryMgmtByIdFromDB } from "../repo/categoryMgmtRepo";
import {
  AccMgmtCreateReqType,
  AccMgmtRspType,
  AccMgmtUpdateReqType,
  AccountTypeBalanceTotalType,
} from "../types/accMgmtType";
import { getCurrencyPreferences } from "./currencyManagementService";

const isEnabledCurrency = async (currencyCode: string) => {
  if (!CURRENCY_CODES.has(currencyCode)) return false;
  const preferences = await getCurrencyPreferences();
  return preferences?.enabledCurrencyCodes.includes(currencyCode) ?? false;
};

export const getAssetBalance = async (currencyCode: string): Promise<number> =>
  getAssetBalanceFromDB(currencyCode);

export const getAccountTypeBalanceTotals = async (): Promise<
  AccountTypeBalanceTotalType[]
> => getAccountTypeBalanceTotalsFromDB();

export const getAccMgmtList = async (
  curPage: number,
  pageSize: number,
  includeInactive = true,
): Promise<AccMgmtRspType[]> => {
  return await getAccMgmtListFromDB({
    orderBy: {
      column: "accounts.created_at",
      direction: "DESC",
    },
    curPage,
    pageSize,
    includeInactive,
  });
};

export const getSelectableAccMgmtList = async (
  curPage: number,
  pageSize: number,
): Promise<AccMgmtRspType[]> =>
  getAccMgmtListFromDB({
    orderBy: { column: "accounts.created_at", direction: "DESC" },
    curPage,
    pageSize,
    enabledCurrenciesOnly: true,
  });

export const createNewAccMgmt = async (
  data: AccMgmtCreateReqType,
): Promise<string | void> => {
  if (!(await isEnabledCurrency(data.currencyCode)))
    return "Selected currency is not enabled.";

  if (!isValidAmount(data.currentBalance || "0", data.currencyCode))
    return "Enter a balance using the currency's decimal precision.";

  const existData = await getAccMgmtByTypeCurrencyAndLabelFromDB(
    data.typeId,
    data.currencyCode,
    data.label,
  );
  if (existData) {
    debugLog(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Duplicate account key found when creating",
      {
        label: data.label,
        typeId: data.typeId,
        currencyCode: data.currencyCode,
        existingId: existData.id,
      },
    );
    return "An account with the same type, currency, and label already exists.";
  }

  await createNewAccMgmtToDB(data);
};

export const getAccMgmtById = async (
  id: string,
): Promise<AccMgmtRspType | null> => {
  return await getAccMgmtByIdFromDB(id);
};

export const updateAccMgmt = async (data: AccMgmtUpdateReqType) => {
  if (!CURRENCY_CODES.has(data.currencyCode)) return "Please select a currency";

  if (!isValidAmount(data.currentBalance || "0", data.currencyCode))
    return "Enter a balance using the currency's decimal precision.";

  const existData = await getAccMgmtByTypeCurrencyAndLabelFromDB(
    data.typeId,
    data.currencyCode,
    data.label,
  );
  if (existData && existData.id !== data.id) {
    debugLog(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Duplicate account key found when updating",
      {
        id: data.id,
        label: data.label,
        typeId: data.typeId,
        currencyCode: data.currencyCode,
        existingId: existData.id,
      },
    );
    return "An account with the same type, currency, and label already exists.";
  }

  const currentAccount = await getAccMgmtByIdFromDB(data.id);
  if (!currentAccount) return "Account not found.";

  if (
    data.currencyCode !== currentAccount.currency_code &&
    !(await isEnabledCurrency(data.currencyCode))
  )
    return "Selected currency is not enabled.";

  const balanceDifference = subtractAmounts(
    data.currentBalance,
    currentAccount.current_balance,
  );

  if (compareAmounts(balanceDifference, 0) !== 0) {
    if (!data.balanceChangeKind)
      return "Choose how to record the balance difference.";

    const expectedKind =
      compareAmounts(balanceDifference, 0) < 0 ? "expense" : "income";
    if (
      data.balanceChangeKind !== "correction" &&
      data.balanceChangeKind !== expectedKind
    )
      return `A ${compareAmounts(balanceDifference, 0) < 0 ? "decrease" : "increase"} must be recorded as ${expectedKind} or a balance correction.`;

    if (data.balanceChangeKind !== "correction") {
      if (!data.balanceChangeCategoryId)
        return `Select a category for the missing ${expectedKind}.`;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.balanceChangeDate ?? ""))
        return `Select a date for the missing ${expectedKind}.`;

      const category = await getCategoryMgmtByIdFromDB(
        data.balanceChangeCategoryId,
      );
      const expectedTypeId = expectedKind === "expense" ? 2 : 1;
      if (!category?.is_active || category.type_id !== expectedTypeId)
        return `Selected category is unavailable for this ${expectedKind}.`;
      if ((data.balanceChangeDescription?.trim().length ?? 0) > 100)
        return "Description must not exceed 100 characters.";
    }
  }

  await updateAccMgmtToDB(data);
};

export const deleteAccMgmt = async (id: string) => {
  await deleteAccMgmtFromDB(id);
};
