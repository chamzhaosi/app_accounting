import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AppSwitch from "../../components/AppSwitch";
import AppText from "../../components/AppText";

import { router, useFocusEffect } from "expo-router";
import { TouchableRipple } from "react-native-paper";
import { SWITCH_LABEL_FONTSIZE } from "../../constants/size";
import {
  authenticateWithLocalAuth,
  getLocalAuthStatus,
  LocalAuthStatus,
} from "../../local/auth";
import {
  APP_PIN_LOCK_KEY,
  BIOMETRIC_LOCK_ENABLED_BY_PIN_PATTERN_KEY,
  BIOMETRIC_LOCK_KEY,
  getStoredItem,
  PIN_PATTERN_LOCK_KEY,
  setStoredItem,
} from "../../local/secureStore";
import { APP_PIN_SETUP_URL } from "../../constants/urls";

export default function Security() {
  const [isBiometricLockEnabled, setIsBiometricLockEnabled] =
    useState<boolean>(false);
  const [isBiometricEnabledByPIN, setIsBiomertricEnabledByPIN] =
    useState<boolean>(false);
  const [isPinPatternLockEnabled, setIsPinPatternLockEnabled] =
    useState<boolean>(false);

  const [localAuthStatus, setLocalAuthStatus] =
    useState<LocalAuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      const loadSecuritySettings = async () => {
        try {
          const [
            biometricStoredValue,
            biomertricEnabledByPIN,
            pinPatternStoredValue,
            authStatus,
          ] = await Promise.all([
            getStoredItem(BIOMETRIC_LOCK_KEY),
            getStoredItem(BIOMETRIC_LOCK_ENABLED_BY_PIN_PATTERN_KEY),
            getStoredItem(PIN_PATTERN_LOCK_KEY),
            getLocalAuthStatus(),
          ]);

          setIsBiomertricEnabledByPIN(biomertricEnabledByPIN === "true");
          setLocalAuthStatus(authStatus);
          setIsBiometricLockEnabled(
            authStatus.canUseBiometricLock && biometricStoredValue === "true",
          );
          setIsPinPatternLockEnabled(
            authStatus.canUsePinPatternLock && pinPatternStoredValue === "true",
          );
        } catch (error) {
          console.error("Failed to load security settings", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadSecuritySettings();
    }, []),
  );

  const handleStoredToggleChange = async (
    key: string,
    value: boolean,
    fallbackCn: () => void,
  ) => {
    try {
      if (value) {
        const isAppPINEnabled = await getStoredItem(APP_PIN_LOCK_KEY);
        if (!isAppPINEnabled) {
          router.push({
            pathname: APP_PIN_SETUP_URL,
            params: {
              localAuthType: key,
              canUseBiometricLock:
                localAuthStatus?.canUseBiometricLock.toString(),
              isBiometricLockEnabled: isBiometricLockEnabled.toString(),
            },
          });
          return;
        }
      }

      setIsSaving(true);
      await setStoredItem(key, value.toString());
      autoOnChangeBiometricLock(key, value);
    } catch (error) {
      console.error(`Failed to save setting for ${key}`, error);
      fallbackCn();
    } finally {
      setIsSaving(false);
    }
  };

  const autoOnChangeBiometricLock = async (
    authType: string,
    value: boolean,
  ) => {
    if (
      authType !== PIN_PATTERN_LOCK_KEY ||
      !localAuthStatus?.canUseBiometricLock ||
      (isBiometricLockEnabled && !isBiometricEnabledByPIN)
    )
      return;

    await setStoredItem(BIOMETRIC_LOCK_KEY, value.toString());
    await setStoredItem(
      BIOMETRIC_LOCK_ENABLED_BY_PIN_PATTERN_KEY,
      value.toString(),
    );
    setIsBiometricLockEnabled(value);
    setIsBiomertricEnabledByPIN(value);
  };

  const handleBiometricLockChange = async (value: boolean) => {
    if (!localAuthStatus?.canUseBiometricLock) return;
    setIsBiometricLockEnabled(value);

    if (!value) {
      const success = await authenticateWithLocalAuth(true);
      if (!success) {
        setIsBiometricLockEnabled(!value);
        return;
      }
    }

    await handleStoredToggleChange(BIOMETRIC_LOCK_KEY, value, () =>
      setIsBiometricLockEnabled(!value),
    );
  };

  const handlePinPatternLockChange = async (value: boolean) => {
    if (!localAuthStatus?.canUsePinPatternLock) return;
    setIsPinPatternLockEnabled(value);

    if (!value) {
      const success = await authenticateWithLocalAuth(true);
      if (!success) {
        setIsPinPatternLockEnabled(!value);
        return;
      }
    }

    await handleStoredToggleChange(PIN_PATTERN_LOCK_KEY, value, () =>
      setIsPinPatternLockEnabled(!value),
    );
  };

  return (
    <ScrollView className="px-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
      <AppSwitch
        label="Biometric Lock"
        disabled={
          isLoading ||
          isSaving ||
          !localAuthStatus?.canUseBiometricLock ||
          isBiometricEnabledByPIN ||
          (isBiometricLockEnabled && isPinPatternLockEnabled)
        }
        value={isBiometricLockEnabled}
        onValueChange={handleBiometricLockChange}
      />
      {!isBiometricLockEnabled && (
        <AppText style={defaultStyles.description}>
          {localAuthStatus?.biometricDescription ??
            "Checking biometric lock support..."}
        </AppText>
      )}

      {(isBiometricEnabledByPIN ||
        (isBiometricLockEnabled && isPinPatternLockEnabled)) && (
        <AppText style={defaultStyles.description}>
          Biometric authentication will always be used first when available,
          even if PIN or Pattern Lock is enabled.
        </AppText>
      )}

      <AppSwitch
        label="PIN or Pattern Lock"
        disabled={
          isLoading || isSaving || !localAuthStatus?.canUsePinPatternLock
        }
        value={isPinPatternLockEnabled}
        onValueChange={handlePinPatternLockChange}
      />
      {!isPinPatternLockEnabled && (
        <AppText style={defaultStyles.description}>
          {localAuthStatus?.pinPatternDescription ??
            "Checking PIN or pattern lock support..."}
        </AppText>
      )}

      <SectionItem
        label="Set/ Update App PIN"
        desciption={
          isBiometricLockEnabled || isPinPatternLockEnabled
            ? "Use this PIN if your device's biometric or screen lock authentication becomes unavailable."
            : "Set an App PIN to protect your Finora account."
        }
        onPress={() => router.push(APP_PIN_SETUP_URL)}
      />
    </ScrollView>
  );
}

const SectionItem = ({
  label,
  desciption,
  onPress,
}: {
  label: string;
  desciption?: string;
  onPress: () => void;
}) => {
  return (
    <TouchableRipple style={defaultStyles.item_container} onPress={onPress}>
      <View className="my-2">
        <AppText style={defaultStyles.item_label}>{label}</AppText>
        <AppText style={defaultStyles.item_description}>{desciption}</AppText>
      </View>
    </TouchableRipple>
  );
};

const defaultStyles = StyleSheet.create({
  description: {
    marginHorizontal: 4,
    marginTop: -8,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  item_container: {
    borderRadius: 10,
    justifyContent: "center",
  },
  item_label: {
    fontSize: SWITCH_LABEL_FONTSIZE,
    paddingLeft: 4,
  },
  item_description: {
    marginHorizontal: 4,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
