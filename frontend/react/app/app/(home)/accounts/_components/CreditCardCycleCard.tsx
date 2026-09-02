import { Linking, StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import AppButton, { ButtonType } from "../../../../components/AppButton";
import type { CreditCardCycleType } from "../../../../sql/types/accMgmtType";
import { useThemeStore } from "../../../../stores/useThemeStore";
import { formatCurrencyAmount } from "../../../../utils/number";
import { useTranslation } from "../../../../i18n/helper";

type Props = {
  cycle: CreditCardCycleType;
  currencyCode: string;
  reminderLeadDays: number;
  reminderTime: string;
  onToggleSkipped: () => void;
  notificationsAvailable: boolean;
};

export default function CreditCardCycleCard({
  cycle,
  currencyCode,
  reminderLeadDays,
  reminderTime,
  onToggleSkipped,
  notificationsAvailable,
}: Props) {
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const periodEndDate = new Date(`${cycle.statement_date}T00:00:00`);
  periodEndDate.setDate(periodEndDate.getDate() - 1);
  const periodEnd = `${periodEndDate.getFullYear()}-${String(periodEndDate.getMonth() + 1).padStart(2, "0")}-${String(periodEndDate.getDate()).padStart(2, "0")}`;
  const actionable =
    cycle.remaining_due > 0 &&
    cycle.status !== "paid" &&
    cycle.status !== "minimum_paid" &&
    cycle.status !== "overdue";
  const shouldOpenSettings = !notificationsAvailable && cycle.remaining_due > 0;
  return (
    <Surface
      elevation={1}
      style={[styles.card, { backgroundColor: THEME.surfaceContainerHigh }]}
    >
      <View style={styles.header}>
        <Text variant="titleMedium">{t("Current statement")}</Text>
        {shouldOpenSettings ? (
          <AppButton
            compact
            style={styles.headerButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            variant={ButtonType.PRIMARY}
            shouldTranslateText={false}
            onPress={() => void Linking.openSettings()}
          >
            {t("Open settings")}
          </AppButton>
        ) : actionable ? (
          <AppButton
            compact
            style={styles.headerButton}
            variant={cycle.is_skipped ? ButtonType.PRIMARY : ButtonType.ERROR}
            onPress={onToggleSkipped}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            shouldTranslateText={false}
          >
            {t(cycle.is_skipped ? "Resume reminder" : "Skip this cycle")}
          </AppButton>
        ) : null}
      </View>
      <Text style={{ color: THEME.onSurfaceVariant }}>
        {cycle.period_start} – {periodEnd}
      </Text>
      <View style={styles.row}>
        <Text>{t("Due {{date}}", { date: cycle.due_date })}</Text>
        <Text variant="titleMedium">
          {formatCurrencyAmount(cycle.statement_amount, currencyCode, locale)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text>{t("Payments & credits")}</Text>
        <Text>
          {formatCurrencyAmount(cycle.credited_amount, currencyCode, locale)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text>{t("Remaining")}</Text>
        <Text variant="titleMedium">
          {formatCurrencyAmount(cycle.remaining_due, currencyCode, locale)}
        </Text>
      </View>
      {cycle.remaining_due <= 0 ? (
        <Text style={{ color: THEME.primary }}>{t("No payment due")}</Text>
      ) : cycle.status === "minimum_paid" ? (
        <Text style={{ color: THEME.primary }}>{t("Minimum paid")}</Text>
      ) : cycle.status === "overdue" ? (
        <Text style={{ color: THEME.error }}>
          {t("Overdue · reminders stopped")}
        </Text>
      ) : cycle.is_skipped ? (
        <Text>{t("Reminder skipped for this cycle")}</Text>
      ) : (
        <Text>
          {t("Daily reminder · {{time}} · {{days}} days before", {
            time: reminderTime,
            days: reminderLeadDays,
          })}
        </Text>
      )}

      {shouldOpenSettings && (
        <Text style={{ color: THEME.error }}>
          {t("Notifications unavailable")}
        </Text>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 16,
    gap: 8,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  headerButton: { borderRadius: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  buttonContent: { marginVertical: 0 },
  buttonLabel: { fontSize: 14 },
});
