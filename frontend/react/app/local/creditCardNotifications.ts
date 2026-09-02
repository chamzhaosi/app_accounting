import { cancelScheduledNotificationAsync } from "expo-notifications/build/cancelScheduledNotificationAsync";
import Constants, { AppOwnership } from "expo-constants";
import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from "expo-notifications/build/NotificationPermissions";
import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";
import { setNotificationChannelAsync } from "expo-notifications/build/setNotificationChannelAsync";
import { AndroidImportance } from "expo-notifications/build/NotificationChannelManager.types";
import { SchedulableTriggerInputTypes } from "expo-notifications/build/Notifications.types";
import type { CreditCardCycleType } from "../sql/types/accMgmtType";
import type { CreditCardSettingRow } from "../sql/repo/creditCardRepo";
import { getCurrencyDecimalDigits } from "../constants/currencies";

const CREDIT_CARD_REMINDER_CHANNEL_ID = "credit-card-reminders";
const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

const prepareCreditCardNotificationChannel = async () => {
  if (isExpoGo) return;
  await setNotificationChannelAsync(CREDIT_CARD_REMINDER_CHANNEL_ID, {
    name: "Credit card reminders",
    importance: AndroidImportance.HIGH,
  });
};

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const cancelCreditCardNotifications = async (rawIds?: string | null) => {
  if (!rawIds) return;
  let ids: string[] = [];
  try {
    ids = JSON.parse(rawIds);
  } catch {
    return;
  }
  await Promise.all(ids.map((id) => cancelScheduledNotificationAsync(id)));
};

export const getCreditCardNotificationPermission = async (
  requestIfNeeded = false,
) => {
  // Android 13 does not show the notification permission prompt until the app
  // has created a channel. Expo Go already provides its project channel and
  // does not expose the custom-channel provider used by standalone builds.
  await prepareCreditCardNotificationChannel();

  const permission = await getPermissionsAsync();
  if (!requestIfNeeded || permission.granted || !permission.canAskAgain) {
    return permission;
  }
  return requestPermissionsAsync();
};

export const scheduleCreditCardNotifications = async (
  setting: CreditCardSettingRow,
  cycle: CreditCardCycleType,
) => {
  const resolved = await getCreditCardNotificationPermission(true);
  if (!resolved.granted) return [];
  const [hour, minute] = setting.reminder_time.split(":").map(Number);
  const due = new Date(`${cycle.due_date}T${setting.reminder_time}:00`);
  const first = new Date(due);
  first.setDate(first.getDate() - setting.reminder_lead_days);
  const now = new Date();
  const identifiers: string[] = [];
  for (const date = first; date <= due; date.setDate(date.getDate() + 1)) {
    const trigger = new Date(date);
    trigger.setHours(hour, minute, 0, 0);
    if (trigger <= now) continue;
    identifiers.push(
      await scheduleNotificationAsync({
        content: {
          title: `${setting.account_label} payment due`,
          body: `${setting.currency_code} ${cycle.remaining_due.toFixed(getCurrencyDecimalDigits(setting.currency_code))} remaining · due ${cycle.due_date}`,
          data: {
            url: `/(home)/accounts/${setting.account_id}?tab=statement`,
            accountId: setting.account_id,
          },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: trigger,
          ...(isExpoGo ? {} : { channelId: CREDIT_CARD_REMINDER_CHANNEL_ID }),
        },
      }),
    );
  }
  return identifiers;
};
