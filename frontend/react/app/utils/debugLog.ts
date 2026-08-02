export enum DEBUG_TAG {
  ACCOUNT_MANAGEMENT = "[AccountManagement]",
  ACCOUNT_MANAGEMENT_DB = "[AccountManagement:DB]",
  ACCOUNT_TYPE = "[AccountType]",
  ACCOUNT_TYPE_DB = "[AccountType:DB]",
  CATEGORY_MANAGEMENT = "[CategoryManagement]",
  CATEGORY_MANAGEMENT_DB = "[CategoryManagement:DB]",
}

export const debugLog = (...args: unknown[]) => {
  if (!__DEV__) return;

  console.log(...args);
};
