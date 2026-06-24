import * as SecureStore from "expo-secure-store";
export const BIOMETRIC_LOCK_KEY = "biometric_lock";
export const PIN_PATTERN_LOCK_KEY = "pin_pattern_lock";
export const APP_PIN_LOCK_KEY = "app_pin_lock";
export const APP_PIN_HASH_KEY = "app_pin_hash";
export const APP_PIN_SALT_KEY = "app_pin_salt";
export const BIOMETRIC_LOCK_ENABLED_BY_PIN_PATTERN_KEY =
  "biometric_lock_enabled_by_pin_pattern";
export const DB_KEY = "finora-db-key";

export const setStoredItem = async (
  key: string,
  value: string,
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error setting item for key ${key}:`, error);
  }
};

export const getStoredItem = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error getting item for key ${key}:`, error);
    return null;
  }
};

export const clearStoredItem = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error clearing item for key ${key}:`, error);
  }
};
