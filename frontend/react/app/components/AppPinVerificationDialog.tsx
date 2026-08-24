import { useEffect, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import AppTextInput from "./AppTextInput";
import { useTranslation } from "../i18n/helper";

type AppPinVerificationDialogProps = {
  visible: boolean;
  isVerifying: boolean;
  onDismiss: () => void;
  onVerify: (pin: string) => Promise<boolean>;
};

export default function AppPinVerificationDialog({
  visible,
  isVerifying,
  onDismiss,
  onVerify,
}: AppPinVerificationDialogProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!visible) return;
    setPin("");
    setErrorMessage("");
  }, [visible]);

  const verify = async () => {
    if (pin.length !== 6) {
      setErrorMessage("Enter your 6-digit app PIN.");
      return;
    }

    Keyboard.dismiss();
    setErrorMessage("");
    const isValid = await onVerify(pin);
    if (!isValid) {
      setPin("");
      setErrorMessage("Incorrect PIN. Please try again.");
    }
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        dismissable={!isVerifying}
        onDismiss={onDismiss}
        style={{ backgroundColor: THEME.surfaceContainerHigh }}
      >
        <Dialog.Title style={{ color: THEME.onSurface }}>
          {t("Authentication required")}
        </Dialog.Title>
        <Dialog.Content>
          <Text
            variant="bodyMedium"
            style={[styles.description, { color: THEME.onSurfaceVariant }]}
          >
            {t("Enter your app PIN to show financial amounts.")}
          </Text>
          <AppTextInput
            autoFocus
            isMaskValue
            keyboardType="number-pad"
            label="App PIN"
            maxLength={6}
            value={pin}
            disabled={isVerifying}
            style={{ backgroundColor: THEME.surfaceContainerHighest }}
            onChangeText={(value) => {
              setPin(value.replace(/\D/g, ""));
              if (errorMessage) setErrorMessage("");
            }}
            onSubmitEditing={() => void verify()}
          />
          {errorMessage ? (
            <Text
              variant="bodySmall"
              style={[styles.error, { color: THEME.error }]}
            >
              {t(errorMessage)}
            </Text>
          ) : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            textColor={THEME.onSurfaceVariant}
            disabled={isVerifying}
            onPress={onDismiss}
          >
            {t("Cancel")}
          </Button>
          <Button
            mode="contained"
            loading={isVerifying}
            disabled={isVerifying || pin.length !== 6}
            onPress={() => void verify()}
          >
            {t("Verify")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  description: { marginBottom: 16 },
  error: { marginTop: 8 },
});
