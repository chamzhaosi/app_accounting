import { useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Badge,
  Button,
  Chip,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";
import AppIcon from "../../components/AppIcon";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import useTransactionSearch from "../../hook/transaction_search/useTransactionSearch";
import { useTranslation } from "../../i18n/helper";
import { useThemeStore } from "../../stores/useThemeStore";
import { formatSectionDate } from "../../utils/date";
import TransactionListRow from "../transaction_management/_components/TransactionListRow";
import TransactionSearchFilters from "./_components/TransactionSearchFilters";

export default function TransactionSearchList() {
  const logic = useTransactionSearch();
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  const listEmpty = (
    <View style={styles.emptyState}>
      {logic.isLoading ? (
        <>
          <ActivityIndicator size="large" />
          <Text style={[styles.emptyText, { color: THEME.onSurfaceVariant }]}>
            {t("Searching...")}
          </Text>
        </>
      ) : (
        <>
          <AppIcon
            name={logic.isSearchActive ? "SearchX" : "Search"}
            size={64}
            color={THEME.onSurfaceVariant}
          />
          <Text
            variant="headlineSmall"
            style={[styles.emptyTitle, { color: THEME.onSurfaceVariant }]}
          >
            {t(
              logic.isSearchActive
                ? "No transactions found"
                : "Search your transactions",
            )}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.emptyText, { color: THEME.onSurfaceVariant }]}
          >
            {t(
              logic.isSearchActive
                ? "No transactions matched your search."
                : "Search by description, category, account, or amount.",
            )}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <AppView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.searchArea}>
          <View style={styles.searchRow}>
            <View style={styles.searchInput}>
              <AppTextInput
                autoFocus
                value={logic.keyword}
                placeholder={t("Search transactions...")}
                returnKeyType="search"
                showClear
                showCounter={false}
                left={<TextInput.Icon icon="magnify" />}
                onChangeText={logic.setKeyword}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  logic.submitSearch();
                }}
              />
            </View>
            <View style={styles.filterAction}>
              <IconButton
                icon="filter-variant"
                size={20}
                accessibilityLabel={t("Filters")}
                style={styles.filterButton}
                iconColor={THEME.primary}
                onPress={() => {
                  Keyboard.dismiss();
                  logic.setFilterError(undefined);
                  setShowFilters(true);
                }}
              />
              {logic.activeFilterCount ? (
                <Badge style={styles.filterBadge}>
                  {logic.activeFilterCount}
                </Badge>
              ) : null}
            </View>
          </View>
        </View>

        {logic.history.length ? (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text variant="titleMedium">{t("Recent Searches")}</Text>
              <Button
                compact
                mode="text"
                labelStyle={styles.clearAllLabel}
                onPress={logic.clearHistory}
              >
                {t("Clear All")}
              </Button>
            </View>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.historyChips}
            >
              {logic.history.map((item) => (
                <Chip
                  key={item.toLocaleLowerCase()}
                  icon="history"
                  closeIcon="close"
                  mode="outlined"
                  compact
                  accessibilityLabel={item}
                  onPress={() => logic.selectHistory(item)}
                  onClose={() => logic.removeHistory(item)}
                  style={{ backgroundColor: THEME.surfaceContainerLow }}
                >
                  {item}
                </Chip>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <FlatList
          data={logic.results}
          keyExtractor={(item) => item.id}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.resultsContent,
            logic.results.length === 0 && styles.emptyResultsContent,
          ]}
          onEndReached={logic.onLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={listEmpty}
          ListHeaderComponent={
            logic.isSearchActive && logic.results.length ? (
              <Text
                variant="titleMedium"
                style={[styles.resultsTitle, { color: THEME.onSurface }]}
              >
                {t("Search Results")}
              </Text>
            ) : null
          }
          ListFooterComponent={
            logic.isFetchingNextPage ? (
              <ActivityIndicator style={styles.footerLoader} />
            ) : null
          }
          renderItem={({ item }) => (
            <View>
              <Text
                variant="titleSmall"
                style={[
                  styles.resultDate,
                  {
                    backgroundColor: THEME.surfaceContainerHigh,
                    color: THEME.onSurfaceVariant,
                  },
                ]}
              >
                {formatSectionDate(item.transactionDate, locale, t)}
              </Text>
              <TransactionListRow item={item} />
            </View>
          )}
        />

        <TransactionSearchFilters
          visible={showFilters}
          filters={logic.filters}
          filterError={logic.filterError}
          accountPickerItems={logic.accountPickerItems}
          categoryOptions={logic.categoryOptions}
          currencyOptions={logic.currencyOptions}
          transactionTypeOptions={logic.transactionTypeOptions}
          onApply={logic.applyFilters}
          onDismiss={() => setShowFilters(false)}
          onReset={logic.resetFilters}
        />
      </KeyboardAvoidingView>
    </AppView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchArea: { paddingLeft: 16, paddingTop: 12 },
  searchRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    marginBottom: 8,
  },
  searchInput: { flex: 1, minWidth: 0 },
  filterAction: { position: "relative", paddingLeft: 4, paddingRight: 12 },
  filterButton: { height: 40, margin: 0, width: 32 },
  filterBadge: { position: "absolute", right: 4, top: -6 },
  historySection: { alignSelf: "stretch", paddingHorizontal: 16 },
  historyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  clearAllLabel: { fontSize: 14 },
  historyChips: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 4,
    paddingRight: 4,
  },
  resultsContent: { paddingBottom: 32 },
  emptyResultsContent: { flexGrow: 1 },
  resultsTitle: { paddingHorizontal: 16, paddingVertical: 10 },
  resultDate: {
    fontSize: 15,
    fontWeight: "700",
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: { marginTop: 12, textAlign: "center" },
  emptyText: { marginTop: 6, textAlign: "center" },
  footerLoader: { marginVertical: 16 },
});
