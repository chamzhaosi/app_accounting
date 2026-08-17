import { useInfiniteQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import { ActivityIndicator, List, Text } from "react-native-paper";
import AppEmpty from "../../../components/AppEmpty";
import AppIcon, { AppIconProps } from "../../../components/AppIcon";
import AppView from "../../../components/AppView";
import { accountManagementQueryKeys } from "../../../constants/queryKeys";
import { FONTS } from "../../../constants/fonts";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../../constants/size";
import { getAccMgmtList } from "../../../sql/service/accMgmtService";
import { AccMgmtRspType } from "../../../sql/types/accMgmtType";
import { useThemeStore } from "../../../stores/useThemeStore";
import { DEBUG_TAG, debugLog } from "../../../utils/debugLog";

const PAGE_SIZE = 40;
const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type AccountTypeSection = {
  typeId: string;
  title: string;
  icon: AppIconProps["name"];
  data: AccMgmtRspType[];
};

export default function AccountsList() {
  const { THEME } = useThemeStore();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: accountManagementQueryKeys.list({ pageSize: PAGE_SIZE }),
    queryFn: ({ pageParam }) => getAccMgmtList(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const accountSections = useMemo<AccountTypeSection[]>(() => {
    const sections = new Map<string, AccountTypeSection>();

    data?.pages.flat().forEach((account) => {
      const section = sections.get(account.type_id);

      if (section) {
        section.data.push(account);
        return;
      }

      sections.set(account.type_id, {
        typeId: account.type_id,
        title: account.type_label,
        icon: account.type_icon as AppIconProps["name"],
        data: [account],
      });
    });

    return Array.from(sections.values()).sort((first, second) =>
      first.title.localeCompare(second.title),
    );
  }, [data]);

  useEffect(() => {
    if (!error) return;

    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when loading accounts page",
      error,
    );
  }, [error]);

  if (isLoading) {
    return (
      <View className="h-full items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <SectionList
        sections={accountSections}
        keyExtractor={(account) => account.id}
        stickySectionHeadersEnabled
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={async () => {
          debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Refreshing accounts page");
          await refetch();
        }}
        onEndReached={() => {
          if (isFetchingNextPage || !hasNextPage) return;
          void fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[
          styles.contentContainer,
          accountSections.length === 0 && styles.emptyContentContainer,
        ]}
        ListEmptyComponent={<AppEmpty />}
        renderSectionHeader={({ section }) => (
          <View
            style={[
              styles.sectionHeader,
              {
                backgroundColor: THEME.surfaceContainerHigh,
                borderBottomColor: THEME.outlineVariant,
              },
            ]}
          >
            <AppIcon name={section.icon} color={THEME.primary} size={22} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text
              variant="labelMedium"
              style={{ color: THEME.onSurfaceVariant }}
            >
              {section.data.length}
            </Text>
          </View>
        )}
        renderItem={({ item: account }) => (
          <List.Item
            centered
            title={account.label}
            titleStyle={styles.accountLabel}
            description={account.descriptions ?? undefined}
            descriptionStyle={styles.accountDescription}
            style={[
              styles.accountItem,
              {
                backgroundColor: THEME.surfaceContainer,
                borderBottomColor: THEME.outlineVariant,
              },
            ]}
            rippleColor={THEME.surfaceContainerHighest}
            onPress={() =>
              router.push(`/(home)/accounts/${account.id}` as Href)
            }
            right={() => (
              <View style={styles.accountBalanceContainer}>
                <Text style={styles.accountBalance}>
                  {amountFormatter.format(account.current_balance)}
                </Text>
                <ChevronRight color={THEME.onSurfaceVariant} size={22} />
              </View>
            )}
          />
        )}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
      />
    </AppView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 24,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  sectionHeader: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: FONTS.ROBOTO,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  accountItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
  },
  accountLabel: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
  },
  accountDescription: {
    fontSize: LIST_ITEM_DESCRIPTION_FONTSIZE,
  },
  accountBalanceContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  accountBalance: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "700",
    marginRight: 8,
  },
  footerLoader: {
    marginVertical: 16,
  },
});
