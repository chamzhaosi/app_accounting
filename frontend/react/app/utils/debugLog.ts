export enum DEBUG_TAG {
  APP = "[App]",
  DATABASE = "[Database]",
  ACCOUNT_MANAGEMENT = "[AccountManagement]",
  ACCOUNT_MANAGEMENT_DB = "[AccountManagement:DB]",
  ACCOUNT_TYPE = "[AccountType]",
  ACCOUNT_TYPE_DB = "[AccountType:DB]",
  CATEGORY_MANAGEMENT = "[CategoryManagement]",
  CATEGORY_MANAGEMENT_DB = "[CategoryManagement:DB]",
  TRANSACTION_MANAGEMENT = "[TransactionManagement]",
  TRANSACTION_MANAGEMENT_DB = "[TransactionManagement:DB]",
  BUDGET = "[Budget]",
  BUDGET_DB = "[Budget:DB]",
  ACCOUNT_SETTINGS = "[AccountSettings]",
  ACCOUNT_SETTINGS_DB = "[AccountSettings:DB]",
}

export const debugLog = (...args: unknown[]) => {
  if (!__DEV__) return;

  console.log(...args);
};
