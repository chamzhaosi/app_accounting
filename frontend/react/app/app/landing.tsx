import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppIconButton from "../components/AppIconButton";
import AppText from "../components/AppText";
import AppView from "../components/AppView";
import {
  authenticateWithLocalAuth,
  EnabledAuthLock,
  getEnabledAuthLocks,
} from "../local/auth";
import {
  BIOMETRIC_LOCK_KEY,
  PIN_PATTERN_LOCK_KEY,
  setStoredItem,
} from "../local/secureStore";
import { useLoadingStore } from "../stores/useLoadingStore";
import { useThemeStore } from "../stores/useThemeStore";

export default function Landing() {
  const { THEME } = useThemeStore();
  const { isLoading } = useLoadingStore();
  const [enabledAuthLocks, setEnabledAuthLocks] =
    useState<EnabledAuthLock | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  useEffect(() => {
    const loadEnabledAuthLocks = async () => {
      const authLocks = await getEnabledAuthLocks();
      setEnabledAuthLocks(authLocks);

      const {
        isEnabledBiometricAuth,
        isEnabledPinPatternAuth,
        isEnabledAppPinAuth,
        localAuthStatus,
      } = authLocks;

      if (
        !isEnabledBiometricAuth &&
        !isEnabledPinPatternAuth &&
        !isEnabledAppPinAuth
      ) {
        router.replace("/(home)/dashboard");
      } else if (
        ((isEnabledBiometricAuth || isEnabledPinPatternAuth) &&
          !localAuthStatus.canUseBiometricLock &&
          !localAuthStatus.canUsePinPatternLock) ||
        (!isEnabledBiometricAuth &&
          !isEnabledPinPatternAuth &&
          isEnabledAppPinAuth)
      ) {
        isEnabledBiometricAuth && setStoredItem(BIOMETRIC_LOCK_KEY, "false");
        isEnabledPinPatternAuth && setStoredItem(PIN_PATTERN_LOCK_KEY, "false");

        router.push("/(auth)/app_pin_login");
      } else {
        handleAuthenticate(authLocks.isEnabledPinPatternAuth);
      }
    };

    loadEnabledAuthLocks();
  }, []);

  const handleAuthenticate = async (isEnabledPinPatternAuth: boolean) => {
    setIsAuthenticating(true);

    try {
      const isAuthenticated = await authenticateWithLocalAuth(
        isEnabledPinPatternAuth,
      );

      if (isAuthenticated) {
        router.replace("/(home)/dashboard");
      }
    } catch (error) {
      console.error("Failed to authenticate with local auth", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <AppView isSafe className="relative flex">
      <View className="flex-[0.8] justify-center items-center">
        <View>
          <AppText isTitle>Finora</AppText>
          <AppText variant="labelLarge">Personal Accounting App</AppText>
        </View>
      </View>

      {(enabledAuthLocks?.isEnabledBiometricAuth ||
        enabledAuthLocks?.isEnabledPinPatternAuth) && (
        <View className="flex-[0.2] items-center">
          <AppIconButton
            iconName="Lock"
            iconSize={60}
            disabled={isLoading || isAuthenticating}
            onPress={() =>
              handleAuthenticate(enabledAuthLocks!.isEnabledPinPatternAuth)
            }
            style={{
              borderRadius: 10,
              padding: 10,
              backgroundColor: THEME.surfaceContainer,
              alignItems: "center",
            }}
          />
        </View>
      )}

      {(isLoading || isAuthenticating) && (
        <View className="absolute inset-0 items-center justify-center z-50 bg-LIGHT-surfaceContainerHighest/50 dark:bg-DARK-surfaceContainerHighest/60">
          <ActivityIndicator size="large" />
        </View>
      )}
    </AppView>
  );
}
