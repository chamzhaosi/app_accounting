import * as LocalAuthentication from "expo-local-authentication";

export type LocalAuthAvailability = {
  available: boolean;
  reason?: "no_hardware" | "not_enrolled" | "no_biometrics";
  authenticationTypes: LocalAuthentication.AuthenticationType[];
  enrolledLevel: LocalAuthentication.SecurityLevel;
  label: string;
};

const AUTH_TYPE_LABELS: Record<LocalAuthentication.AuthenticationType, string> =
  {
    [LocalAuthentication.AuthenticationType.FINGERPRINT]: "Fingerprint",
    [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: "Face ID",
    [LocalAuthentication.AuthenticationType.IRIS]: "Iris",
  };

const AUTH_ERROR_MESSAGES: Partial<
  Record<LocalAuthentication.LocalAuthenticationError, string>
> = {
  authentication_failed: "Authentication failed. Please try again.",
  invalid_context: "Authentication is not available right now.",
  lockout: "Too many attempts. Please unlock your device and try again.",
  not_available: "Biometric authentication is not available on this device.",
  not_enrolled:
    "Please set up fingerprint or face unlock on your device first.",
  passcode_not_set: "Please set up a device passcode first.",
  timeout: "Authentication timed out. Please try again.",
  unable_to_process: "Unable to process biometric authentication.",
  user_cancel: "Authentication cancelled.",
  user_fallback: "Please sign in with your password.",
};

export function getLocalAuthLabel(
  authenticationTypes: LocalAuthentication.AuthenticationType[],
) {
  if (authenticationTypes.length === 0) return "Biometric";

  return authenticationTypes
    .map((type) => AUTH_TYPE_LABELS[type] ?? "Biometric")
    .join(" / ");
}

export function getLocalAuthErrorMessage(
  error?: LocalAuthentication.LocalAuthenticationError,
) {
  if (!error) return "Biometric authentication failed.";

  return AUTH_ERROR_MESSAGES[error] ?? "Biometric authentication failed.";
}

export async function getLocalAuthAvailability(): Promise<LocalAuthAvailability> {
  const [hasHardware, isEnrolled, authenticationTypes, enrolledLevel] =
    await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
      LocalAuthentication.getEnrolledLevelAsync(),
    ]);

  const label = getLocalAuthLabel(authenticationTypes);

  if (!hasHardware) {
    return {
      available: false,
      reason: "no_hardware",
      authenticationTypes,
      enrolledLevel,
      label,
    };
  }

  if (!isEnrolled) {
    return {
      available: false,
      reason: "not_enrolled",
      authenticationTypes,
      enrolledLevel,
      label,
    };
  }

  if (authenticationTypes.length === 0) {
    return {
      available: false,
      reason: "no_biometrics",
      authenticationTypes,
      enrolledLevel,
      label,
    };
  }

  return {
    available: true,
    authenticationTypes,
    enrolledLevel,
    label,
  };
}

export async function authenticate() {
  const availability = await getLocalAuthAvailability();

  if (!availability.available) {
    return {
      success: false,
      availability,
      error: availability.reason,
      message:
        availability.reason === "not_enrolled"
          ? "Please set up fingerprint or face unlock on your device first."
          : "Biometric authentication is not available on this device.",
    };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Login to Finora",
    promptSubtitle: availability.label,
    promptDescription: "Confirm your identity to continue",
    cancelLabel: "Cancel",
    fallbackLabel: "Use passcode",
    biometricsSecurityLevel: "strong",
    requireConfirmation: true,
  });

  return {
    ...result,
    availability,
    message: result.success
      ? "Authentication successful."
      : getLocalAuthErrorMessage(result.error),
  };
}

export async function avlbAuthType() {
  return LocalAuthentication.supportedAuthenticationTypesAsync();
}

export async function isEnblAuth() {
  return LocalAuthentication.isEnrolledAsync();
}

export async function checkAll() {
  return getLocalAuthAvailability();
}
