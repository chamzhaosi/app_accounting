import * as LocalAuthentication from "expo-local-authentication";
import {
  APP_PIN_HASH_KEY,
  APP_PIN_LOCK_KEY,
  APP_PIN_SALT_KEY,
  BIOMETRIC_LOCK_KEY,
  clearStoredItem,
  getStoredItem,
  PIN_PATTERN_LOCK_KEY,
  setStoredItem,
} from "./secureStore";
import * as Crypto from "expo-crypto";

export type LocalAuthStatus = {
  canUseBiometricLock: boolean;
  biometricDescription: string;
  canUsePinPatternLock: boolean;
  pinPatternDescription: string;
  authenticationType: string;
};

export type EnabledAuthLock = {
  isEnabledPinPatternAuth: boolean;
  isEnabledBiometricAuth: boolean;
  isEnabledAppPinAuth: boolean;
  localAuthStatus: LocalAuthStatus;
};

const getAuthenticationTypeLabel = (authenticationType: number): string => {
  switch (authenticationType) {
    case LocalAuthentication.AuthenticationType.IRIS:
      return "Iris recognition";
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return "Face recognition";
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return "Fingerprint";
    default:
      return "Unknown authentication";
  }
};

const getHighestAuthenticationType = (
  authenticationTypes: number[],
): number | null => {
  const priority = [
    LocalAuthentication.AuthenticationType.IRIS,
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
    LocalAuthentication.AuthenticationType.FINGERPRINT,
  ];

  return (
    priority.find((authenticationType) =>
      authenticationTypes.includes(authenticationType),
    ) ?? null
  );
};

export const getLocalAuthStatus = async (): Promise<LocalAuthStatus> => {
  const [hasHardware, isEnrolled, supportedAuthenticationTypes, securityLevel] =
    await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
      LocalAuthentication.getEnrolledLevelAsync(),
    ]);

  const canUsePinPatternLock =
    securityLevel >= LocalAuthentication.SecurityLevel.SECRET;

  if (!hasHardware) {
    return {
      canUseBiometricLock: false,
      biometricDescription:
        "Biometric lock is unavailable because this device does not have supported biometric hardware.",
      canUsePinPatternLock,
      pinPatternDescription: canUsePinPatternLock
        ? `PIN or pattern lock can use your enrolled device credential.`
        : "PIN or pattern lock is unavailable because no device credential is enrolled.",
      authenticationType: "None",
    };
  }

  if (!isEnrolled) {
    return {
      canUseBiometricLock: false,
      biometricDescription:
        "Biometric lock is unavailable because no biometric authentication is enrolled. Add fingerprint, face, or iris authentication in your device settings.",
      canUsePinPatternLock,
      pinPatternDescription: canUsePinPatternLock
        ? `PIN or pattern lock can use your enrolled device credential.`
        : "PIN or pattern lock is unavailable because no device credential is enrolled.",
      authenticationType: "None",
    };
  }

  const highestAuthenticationType = getHighestAuthenticationType(
    supportedAuthenticationTypes,
  );
  const authenticationType = highestAuthenticationType
    ? getAuthenticationTypeLabel(highestAuthenticationType)
    : "Unknown authentication";
  const canUseBiometricLock =
    securityLevel >= LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK &&
    highestAuthenticationType !== null;
  const pinPatternDescription = canUsePinPatternLock
    ? `PIN or pattern lock can use your enrolled device credential.`
    : "PIN or pattern lock is unavailable because no device PIN, pattern, or passcode is enrolled.";

  if (!canUseBiometricLock) {
    return {
      canUseBiometricLock: false,
      biometricDescription:
        "Biometric lock is unavailable because the enrolled local authentication is not a supported biometric method.",
      canUsePinPatternLock,
      pinPatternDescription,
      authenticationType,
    };
  }

  return {
    canUseBiometricLock: true,
    biometricDescription: `Biometric lock will use ${authenticationType}.`,
    canUsePinPatternLock,
    pinPatternDescription,
    authenticationType,
  };
};

export const getEnabledAuthLocks = async (): Promise<EnabledAuthLock> => {
  const [
    biometricStoredValue,
    pinPatternStoredValue,
    appPinStoredValue,
    localAuthStatus,
  ] = await Promise.all([
    getStoredItem(BIOMETRIC_LOCK_KEY),
    getStoredItem(PIN_PATTERN_LOCK_KEY),
    getStoredItem(APP_PIN_LOCK_KEY),
    getLocalAuthStatus(),
  ]);

  return {
    isEnabledPinPatternAuth: pinPatternStoredValue === "true",
    isEnabledBiometricAuth: biometricStoredValue === "true",
    isEnabledAppPinAuth: appPinStoredValue === "true",
    localAuthStatus: localAuthStatus,
  };
};

export const authenticateWithLocalAuth = async (
  isEnabledPinPatternAuth: boolean,
): Promise<boolean> => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock with biometric authentication",
    promptSubtitle: "Use your enrolled biometric method",
    promptDescription: "Confirm your identity to continue.",
    cancelLabel: "Cancel",
    disableDeviceFallback: !isEnabledPinPatternAuth,
  });

  return result.success;
};

export async function createPin(pin: string) {
  const salt = Crypto.randomUUID();

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + pin,
  );

  setStoredItem(APP_PIN_HASH_KEY, hash);
  setStoredItem(APP_PIN_SALT_KEY, salt);
}

export async function checkPin(pin: string): Promise<boolean> {
  const hash = await getStoredItem(APP_PIN_HASH_KEY);
  const salt = await getStoredItem(APP_PIN_SALT_KEY);

  if (!hash || !salt) return false;

  const inputHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + pin,
  );

  return inputHash === hash;
}

export const clearAppPINLock = async () => {
  try {
    await clearStoredItem(APP_PIN_HASH_KEY);
    // await clearStoredItem(APP_PIN_SALT_KEY);
    // await clearStoredItem(APP_PIN_LOCK_KEY);
  } catch (error) {
    console.error("Error clearing app lock data", error);
  }
};
