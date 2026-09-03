import { Href, router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import AppIcon from "../../../components/AppIcon";
import { TXN_TYPE_ENUM } from "../../../constants/enum";
import { FONTS } from "../../../constants/fonts";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../../constants/size";
import {
  ACCOUNT_MANAGEMENT_BASE_URL,
  TRANSACTION_MANAGEMENT_BASE_URL,
} from "../../../constants/urls";
import type { TransactionListItem } from "../../../hook/transaction_management/transactionList.utils";
import useSingleCurrencyMode from "../../../hook/currency_management/useSingleCurrencyMode";
import { useTranslation } from "../../../i18n/helper";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import { useThemeStore } from "../../../stores/useThemeStore";
import { compareAmounts } from "../../../utils/amount";
import {
  formatPrivateCurrencyAmount,
  formatPrivateSignedCurrencyAmount,
} from "../../../utils/number";

export default function TransactionListRow({
  item,
}: {
  item: TransactionListItem;
}) {
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const isSingleCurrency = useSingleCurrencyMode();
  const isAdjustment = item.transactionType === TXN_TYPE_ENUM.ADJUSTMENT;
  const isPositiveEffect = compareAmounts(item.balanceEffect, 0) > 0;
  const isNegativeEffect = compareAmounts(item.balanceEffect, 0) < 0;
  const amountColor = isNegativeEffect
    ? THEME.error
    : isPositiveEffect
      ? THEME.primary
      : THEME.onSurface;
  const iconColor = isNegativeEffect
    ? THEME.error
    : isPositiveEffect
      ? THEME.primary
      : THEME.onSurfaceVariant;
  const transactionUrl =
    isAdjustment && item.accountId
      ? `${ACCOUNT_MANAGEMENT_BASE_URL}/${item.accountId}`
      : `${TRANSACTION_MANAGEMENT_BASE_URL}/${item.id}`;
  const displayAmount = formatPrivateSignedCurrencyAmount(
    item.balanceEffect,
    item.primaryCurrencyCode,
    locale,
    areAmountsVisible,
    !isSingleCurrency,
  );
  const secondaryAmount = item.secondaryCurrencyCode
    ? formatPrivateCurrencyAmount(
        item.secondaryAmount,
        item.secondaryCurrencyCode,
        locale,
        areAmountsVisible,
        !isSingleCurrency,
      )
    : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}${
        item.description ? `, ${item.description}` : ""
      }${item.hasAttachments ? `, ${t("Has attachments")}` : ""}, ${displayAmount}${
        secondaryAmount ? `, ${secondaryAmount}` : ""
      }`}
      accessibilityHint={
        isAdjustment
          ? t("Opens the account for balance editing")
          : t("Opens transaction details for editing")
      }
      android_ripple={{ color: THEME.outlineVariant }}
      onPress={() => router.push(transactionUrl as Href)}
      style={({ pressed }) => [
        styles.pressable,
        { backgroundColor: THEME.surfaceContainerLow },
        pressed && [
          styles.pressed,
          { backgroundColor: THEME.surfaceContainerHighest },
        ],
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: THEME.surfaceContainerHighest },
          ]}
        >
          <AppIcon name={item.icon} color={iconColor} size={22} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.title, { color: THEME.onSurface }]}
            >
              {item.title}
            </Text>
            {item.hasAttachments ? (
              <View style={styles.attachmentIcon}>
                <AppIcon name="Paperclip" color={THEME.primary} size={16} />
              </View>
            ) : null}
          </View>
          {item.transactionType === TXN_TYPE_ENUM.TRANSFER ? (
            <View style={styles.transferSubtitle}>
              <Text
                numberOfLines={1}
                style={[
                  styles.subtitle,
                  styles.transferAccountText,
                  { color: THEME.onSurfaceVariant },
                ]}
              >
                {item.fromAccountLabel}
              </Text>
              <View style={styles.transferArrow}>
                <AppIcon
                  name="MoveRight"
                  color={THEME.onSurfaceVariant}
                  size={14}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.subtitle,
                  styles.transferAccountText,
                  { color: THEME.onSurfaceVariant },
                ]}
              >
                {item.toAccountLabel}
              </Text>
            </View>
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, { color: THEME.onSurfaceVariant }]}
            >
              {item.subtitle}
            </Text>
          )}
          {item.description ? (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.description, { color: THEME.onSurfaceVariant }]}
            >
              {item.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.amounts}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            numberOfLines={2}
            style={[styles.amount, { color: amountColor }]}
          >
            {displayAmount}
          </Text>
          {secondaryAmount ? (
            <Text
              variant="labelSmall"
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              numberOfLines={2}
              style={[
                styles.secondaryAmount,
                { color: THEME.onSurfaceVariant },
              ]}
            >
              {secondaryAmount}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: "100%" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "nowrap",
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "100%",
  },
  iconContainer: {
    alignItems: "center",
    borderRadius: 20,
    flexShrink: 0,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  textContainer: { flex: 1, marginLeft: 12, marginRight: 8, minWidth: 0 },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    minWidth: 0,
  },
  attachmentIcon: { flexShrink: 0 },
  title: {
    flexShrink: 1,
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "600",
    minWidth: 0,
  },
  subtitle: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_DESCRIPTION_FONTSIZE - 2,
    marginTop: 2,
  },
  description: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_DESCRIPTION_FONTSIZE - 3,
    marginTop: 2,
  },
  amounts: {
    alignItems: "flex-end",
    flexShrink: 1,
    maxWidth: "50%",
    minWidth: 0,
  },
  amount: {
    flexShrink: 1,
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "700",
    maxWidth: "100%",
    textAlign: "right",
  },
  secondaryAmount: { maxWidth: "100%", textAlign: "right" },
  transferSubtitle: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 2,
    minWidth: 0,
  },
  transferAccountText: { flexShrink: 1, marginTop: 0 },
  transferArrow: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
});
