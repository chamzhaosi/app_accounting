import { useCallback, useState } from "react";
import {
  authenticateWithLocalAuth,
  checkPin,
  getEnabledAuthLocks,
} from "../../local/auth";
import { useAmountPrivacyStore } from "../../stores/useAmountPrivacyStore";

export default function useAmountPrivacyToggle() {
  const { areAmountsVisible, isHydrated, setAmountsVisible } =
    useAmountPrivacyStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isPinDialogVisible, setIsPinDialogVisible] = useState(false);

  const toggleAmountsVisibility = useCallback(async () => {
    if (!isHydrated || isAuthenticating) return;

    if (areAmountsVisible) {
      await setAmountsVisible(false);
      return;
    }

    try {
      setIsAuthenticating(true);
      const authLocks = await getEnabledAuthLocks();
      const hasDeviceAuthEnabled =
        authLocks.isEnabledBiometricAuth || authLocks.isEnabledPinPatternAuth;
      const canUseEnabledDeviceAuth =
        (authLocks.isEnabledBiometricAuth &&
          authLocks.localAuthStatus.canUseBiometricLock) ||
        (authLocks.isEnabledPinPatternAuth &&
          authLocks.localAuthStatus.canUsePinPatternLock);

      if (hasDeviceAuthEnabled && canUseEnabledDeviceAuth) {
        const isAuthenticated = await authenticateWithLocalAuth(
          authLocks.isEnabledPinPatternAuth,
        );
        if (isAuthenticated) await setAmountsVisible(true);
        return;
      }

      if (authLocks.isEnabledAppPinAuth) {
        setIsPinDialogVisible(true);
        return;
      }

      await setAmountsVisible(true);
    } catch (error) {
      console.error("Failed to authenticate before revealing amounts", error);
    } finally {
      setIsAuthenticating(false);
    }
  }, [areAmountsVisible, isAuthenticating, isHydrated, setAmountsVisible]);

  const verifyAppPin = useCallback(
    async (pin: string): Promise<boolean> => {
      try {
        setIsAuthenticating(true);
        const isValid = await checkPin(pin);
        if (!isValid) return false;

        await setAmountsVisible(true);
        setIsPinDialogVisible(false);
        return true;
      } catch (error) {
        console.error(
          "Failed to verify app PIN before revealing amounts",
          error,
        );
        return false;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [setAmountsVisible],
  );

  const dismissPinDialog = useCallback(() => {
    if (!isAuthenticating) setIsPinDialogVisible(false);
  }, [isAuthenticating]);

  return {
    areAmountsVisible,
    isAuthenticating,
    isHydrated,
    isPinDialogVisible,
    dismissPinDialog,
    toggleAmountsVisibility,
    verifyAppPin,
  };
}
