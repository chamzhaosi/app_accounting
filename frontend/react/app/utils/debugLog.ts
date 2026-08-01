export enum DEBUG_TAG {
  ACCOUNT_TYPE = "[AccountType]",
  ACCOUNT_TYPE_DB = "[AccountType:DB]",
}

export const debugLog = (...args: unknown[]) => {
  if (!__DEV__) return;

  console.log(...args);
};
