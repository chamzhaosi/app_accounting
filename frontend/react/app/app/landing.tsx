import dayjs from "dayjs";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
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
  BIOMETRIC_LOCK_ENABLED_BY_PIN_PATTERN_KEY,
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
import { APP_PIN_LOGIN_URL, DASHBOARD_URL } from "../constants/urls";

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
      loadAuthLockPage(authLocks);
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
        router.replace(DASHBOARD_URL);
      }
    } catch (error) {
      console.error("Failed to authenticate with local auth", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadAuthLockPage = async (authLocks: EnabledAuthLock) => {
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
      router.replace(DASHBOARD_URL);
      return;
    }

    if (shouldGoAppPinLogin) {
      if (isEnabledBiometricAuth) {
        await setStoredItem(BIOMETRIC_LOCK_KEY, "false");
        await setStoredItem(BIOMETRIC_LOCK_ENABLED_BY_PIN_PATTERN_KEY, "false");
      }

      if (isEnabledPinPatternAuth) {
        await setStoredItem(PIN_PATTERN_LOCK_KEY, "false");
      }

      router.push(APP_PIN_LOGIN_URL);
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
              style={[
                defaultStyle.iconBtn,
                {
                  opacity: isAccountFrozen ? 0.2 : 1,
                  backgroundColor: THEME.surfaceContainer,
                },
              ]}
            />
          ) : (
            <View
              className="py-4 px-8"
              style={[
                defaultStyle.accFrozenContainer,
                {
                  backgroundColor: THEME.errorContainer,
                },
              ]}
            >
              <AppText
                style={[
                  defaultStyle.accFrozenLabel,
                  { color: THEME.onErrorContainer },
                ]}
                className="self-center"
              >
                Too many incorrect PIN attempts.
              </AppText>
              <AppText
                style={[
                  defaultStyle.accFrozenLabel,
                  { color: THEME.onErrorContainer },
                ]}
              >
                <>Please try again in </>
                <AppText
                  style={[
                    ,
                    defaultStyle.accFrozenTime,
                    { color: THEME.onErrorContainer },
                  ]}
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

const defaultStyle = StyleSheet.create({
  iconBtn: {
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  accFrozenContainer: {
    borderRadius: 4,
  },
  accFrozenLabel: {
    fontSize: 18,
  },
  accFrozenTime: {
    fontSize: 22,
  },
});
