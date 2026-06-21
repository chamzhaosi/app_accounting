import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AppSwitch from "../../components/AppSwitch";
import AppText from "../../components/AppText";

import { router } from "expo-router";
import { TouchableRipple } from "react-native-paper";
import { SWITCH_LABEL_FONTSIZE } from "../../constants/size";
import { getLocalAuthStatus, LocalAuthStatus } from "../../local/auth";
import {
  APP_PIN_LOCK_KEY,
  BIOMETRIC_LOCK_KEY,
  getStoredItem,
  PIN_PATTERN_LOCK_KEY,
  setStoredItem,
} from "../../local/secureStore";
import { useLocalAuthStore } from "../../stores/useLocalAuthStore";

// TODO: when unenable the swtich need to auth one more time
export default function Security() {
  const { localAuthType, setLocalAuthType } = useLocalAuthStore();

  const [isBiometricLockEnabled, setIsBiometricLockEnabled] =
    useState<boolean>(false);
  const [isPinPatternLockEnabled, setIsPinPatternLockEnabled] =
    useState<boolean>(false);
  const [localAuthStatus, setLocalAuthStatus] =
    useState<LocalAuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const [biometricStoredValue, pinPatternStoredValue, authStatus] =
          await Promise.all([
            getStoredItem(BIOMETRIC_LOCK_KEY),
            getStoredItem(PIN_PATTERN_LOCK_KEY),
            getLocalAuthStatus(),
          ]);

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
  }, []);

  useEffect(() => {
    if (!localAuthType || !localAuthStatus) return;

    switch (localAuthType) {
      case BIOMETRIC_LOCK_KEY:
        handleBiometricLockChange(true);
        break;
      case PIN_PATTERN_LOCK_KEY:
        handlePinPatternLockChange(true);
        break;
    }
    setLocalAuthType(null);
  }, [localAuthType, localAuthStatus]);

  const handleStoredToggleChange = async (
    key: string,
    value: boolean,
    setValue: (value: boolean) => void,
  ) => {
    try {
      if (value) {
        const isAppPINEnabled = await getStoredItem(APP_PIN_LOCK_KEY);
        if (!isAppPINEnabled) {
          router.push({
            pathname: "/security/app_pin",
            params: {
              lock_type: key,
            },
          });
          return;
        }
      }

      setIsSaving(true);
      await setStoredItem(key, value.toString());
      setValue(value);
    } catch (error) {
      console.error(`Failed to save setting for ${key}`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBiometricLockChange = async (value: boolean) => {
    if (!localAuthStatus?.canUseBiometricLock) return;

    await handleStoredToggleChange(
      BIOMETRIC_LOCK_KEY,
      value,
      setIsBiometricLockEnabled,
    );
  };

  const handlePinPatternLockChange = async (value: boolean) => {
    if (!localAuthStatus?.canUsePinPatternLock) return;

    await handleStoredToggleChange(
      PIN_PATTERN_LOCK_KEY,
      value,
      setIsPinPatternLockEnabled,
    );
  };

  return (
    <ScrollView className="px-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
      <AppSwitch
        label="Biometric Lock"
        disabled={
          isLoading || isSaving || !localAuthStatus?.canUseBiometricLock
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
        label="Set/ Change App PIN"
        desciption="Use this PIN if your device's biometric or screen lock authentication becomes unavailable."
        onPress={() => router.push("/security/app_pin")}
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
