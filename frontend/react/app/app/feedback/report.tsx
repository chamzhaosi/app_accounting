import * as Application from "expo-application";
import * as Device from "expo-device";
import { getLocales } from "expo-localization";
import * as MailComposer from "expo-mail-composer";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert, Platform, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import AppView from "../../components/AppView";
import { useTranslation } from "../../i18n/helper";

type FeedbackType = "bug" | "suggest";
type Translator = (
  text: string,
  values?: Record<string, string | number>,
) => string;

const FEEDBACK_RECIPIENT = "cham@gmail.com";

const valueOrUnknown = (value: string | number | null | undefined) =>
  value ?? "Unknown";

const getDeviceType = () =>
  Device.DeviceType[
    Device.deviceType ?? Device.DeviceType.UNKNOWN
  ].toLowerCase();

const getAppVersion = () => {
  const version = valueOrUnknown(Application.nativeApplicationVersion);
  const build = valueOrUnknown(Application.nativeBuildVersion);

  return `${version} (${build})`;
};

const getBugReportBody = (t: Translator) => {
  const locale = getLocales()[0]?.languageTag;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const device = [Device.manufacturer, Device.brand, Device.modelName]
    .filter(Boolean)
    .join(" ");

  return [
    t("Hi Finora team,"),
    "",
    t("What happened?"),
    t("[Describe the problem]"),
    "",
    t("What did you expect to happen?"),
    t("[Describe the expected result]"),
    "",
    t("Steps to reproduce:"),
    "1. ",
    "2. ",
    "3. ",
    "",
    t("Additional details:"),
    t("[Add screenshots or anything else that may help]"),
    "",
    "--- Diagnostic information (please keep this section) ---",
    `App version: ${getAppVersion()}`,
    `Application ID: ${valueOrUnknown(Application.applicationId)}`,
    `Platform: ${Platform.OS}`,
    `OS: ${valueOrUnknown(Device.osName)} ${valueOrUnknown(Device.osVersion)}`,
    `Platform API level: ${valueOrUnknown(Device.platformApiLevel)}`,
    `Device: ${device || "Unknown"}`,
    `Device type: ${getDeviceType()}`,
    `Physical device: ${Device.isDevice ? "Yes" : "No (emulator/simulator)"}`,
    `Locale: ${valueOrUnknown(locale)}`,
    `Time zone: ${valueOrUnknown(timeZone)}`,
    `Report time: ${new Date().toISOString()}`,
  ].join("\n");
};

const getSuggestionBody = (t: Translator) =>
  [
    t("Hi Finora team,"),
    "",
    t("I would like to suggest the following idea:"),
    t("[Describe your idea]"),
    "",
    t("Why would this be useful?"),
    t("[Describe the benefit or problem it would solve]"),
    "",
    t("Anything else?"),
    t("[Add examples or other details]"),
    "",
    `App version: ${getAppVersion()}`,
  ].join("\n");

const isFeedbackType = (value: string | undefined): value is FeedbackType =>
  value === "bug" || value === "suggest";

export default function FeedbackReport() {
  const { type: typeParam } = useLocalSearchParams<{ type?: string }>();
  const { t } = useTranslation();
  const hasOpenedComposer = useRef(false);

  useEffect(() => {
    if (hasOpenedComposer.current) return;
    hasOpenedComposer.current = true;

    const type = Array.isArray(typeParam) ? typeParam[0] : typeParam;

    const openEmailComposer = async () => {
      if (!isFeedbackType(type)) {
        Alert.alert(
          t("Invalid feedback type"),
          t("Please return and try again."),
          [{ text: t("OK"), onPress: () => router.back() }],
        );
        return;
      }

      try {
        const isAvailable = await MailComposer.isAvailableAsync();
        if (!isAvailable) {
          throw new Error("No email application is available.");
        }

        await MailComposer.composeAsync({
          recipients: [FEEDBACK_RECIPIENT],
          subject:
            type === "bug"
              ? `[Finora] ${t("Bug report")}`
              : `[Finora] ${t("Feature suggestion")}`,
          body: type === "bug" ? getBugReportBody(t) : getSuggestionBody(t),
        });
        router.back();
      } catch (error) {
        console.error("Unable to open the feedback email composer", error);
        Alert.alert(
          t("Email unavailable"),
          t("Please email your feedback to {{email}}.", {
            email: FEEDBACK_RECIPIENT,
          }),
          [{ text: t("OK"), onPress: () => router.back() }],
        );
      }
    };

    void openEmailComposer();
  }, [t, typeParam]);

  return (
    <AppView style={styles.container}>
      <ActivityIndicator size="large" />
      <Text variant="bodyLarge">{t("Opening your email app...")}</Text>
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
});
