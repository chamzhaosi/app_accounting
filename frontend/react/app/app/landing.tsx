import dayjs from "dayjs";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppIconButton from "../components/AppIconButton";
import AppText, { TextTypEnum } from "../components/AppText";
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
import {
  ACCOUNT_FROZEN_SECONDS,
  useLocalAuthStore,
} from "../stores/useLocalAuthStore";
import { useThemeStore } from "../stores/useThemeStore";

export default function Landing() {
  const { THEME } = useThemeStore();
  const { isLoading } = useLoadingStore();
  const {
    lastErrorAuthDateTime,
    setAuthErrorCounter,
    setLastErrorAuthDateTime,
  } = useLocalAuthStore();

  const [enabledAuthLocks, setEnabledAuthLocks] =
    useState<EnabledAuthLock | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isAccountFrozen, setIsAccountFrozen] = useState<boolean>();
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const hasAuthLockReq =
    enabledAuthLocks?.isEnabledBiometricAuth ||
    enabledAuthLocks?.isEnabledPinPatternAuth ||
    enabledAuthLocks?.isEnabledAppPinAuth;

  useFocusEffect(
    useCallback(() => {
      if (!lastErrorAuthDateTime) return;
      setIsAccountFrozen(true);
      const unlockTime = lastErrorAuthDateTime.add(
        ACCOUNT_FROZEN_SECONDS,
        "seconds",
      );
      const timer = setInterval(() => {
        const remaining = Math.max(0, unlockTime.diff(dayjs(), "second"));
        setRemainingTime(remaining);

        if (remaining <= 0) {
          setIsAccountFrozen(false);
          setAuthErrorCounter(0);
          setLastErrorAuthDateTime(null);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }, [lastErrorAuthDateTime]),
  );

  useEffect(() => {
    const fetchEnabledAuthLocks = async () => {
      const authLocks = await getEnabledAuthLocks();
      setEnabledAuthLocks(authLocks);
      // loadAuthLockPage(authLocks);
    };

    fetchEnabledAuthLocks();
  }, []);

  const handleAuthenticate = async (isEnabledPinPatternAuth?: boolean) => {
    try {
      setIsAuthenticating(true);
      const isAuthenticated = await authenticateWithLocalAuth(
        isEnabledPinPatternAuth ?? enabledAuthLocks!.isEnabledPinPatternAuth,
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

  const loadAuthLockPage = (authLocks: EnabledAuthLock) => {
    if (isAccountFrozen) return;

    const {
      isEnabledBiometricAuth,
      isEnabledPinPatternAuth,
      isEnabledAppPinAuth,
      localAuthStatus,
    } = authLocks;

    const hasDeviceAuthEnabled =
      isEnabledBiometricAuth || isEnabledPinPatternAuth;

    const hasAnyAuthEnabled = hasDeviceAuthEnabled || isEnabledAppPinAuth;

    const cannotUseDeviceAuth =
      !localAuthStatus.canUseBiometricLock &&
      !localAuthStatus.canUsePinPatternLock;

    const shouldGoDashboard = !hasAnyAuthEnabled;

    const shouldGoAppPinLogin =
      (hasDeviceAuthEnabled && cannotUseDeviceAuth) ||
      (!hasDeviceAuthEnabled && isEnabledAppPinAuth);

    if (shouldGoDashboard) {
      router.replace("/(home)/dashboard");
      return;
    }

    if (shouldGoAppPinLogin) {
      if (isEnabledBiometricAuth) {
        setStoredItem(BIOMETRIC_LOCK_KEY, "false");
      }

      if (isEnabledPinPatternAuth) {
        setStoredItem(PIN_PATTERN_LOCK_KEY, "false");
      }

      router.push("/(auth)/app_pin_login");
      return;
    }

    handleAuthenticate(isEnabledPinPatternAuth);
  };

  return (
    <AppView isSafe className="relative flex">
      <View className="flex-[0.8] justify-center items-center">
        <View>
          <AppText isTitle>Finora</AppText>
          <AppText variant="labelLarge">Personal Accounting App</AppText>
        </View>
      </View>

      {hasAuthLockReq && (
        <View className="flex-[0.2] items-center">
          {!isAccountFrozen ? (
            <AppIconButton
              iconName="Lock"
              iconSize={60}
              disabled={isLoading || isAuthenticating || isAccountFrozen}
              onPress={() => loadAuthLockPage(enabledAuthLocks)}
              style={{
                opacity: isAccountFrozen ? 0.2 : 1,
                borderRadius: 10,
                padding: 10,
                backgroundColor: THEME.surfaceContainer,
                alignItems: "center",
              }}
            />
          ) : (
            <View
              className="py-4 px-8"
              style={{
                backgroundColor: THEME.errorContainer,
                borderRadius: 4,
              }}
            >
              <AppText
                style={{ fontSize: 18, color: THEME.onErrorContainer }}
                className="self-center"
              >
                Too many incorrect PIN attempts.
              </AppText>
              <AppText style={{ fontSize: 18, color: THEME.onErrorContainer }}>
                <>Please try again in </>
                <AppText
                  style={{ fontSize: 22, color: THEME.onErrorContainer }}
                >
                  {remainingTime}
                </AppText>
                <> seconds.</>
              </AppText>
            </View>
          )}
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
