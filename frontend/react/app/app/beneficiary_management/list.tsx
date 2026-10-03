import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import {
  TabBar,
  TabView,
  type Route,
  type TabBarProps,
} from "react-native-tab-view";
import AppEmpty from "../../components/AppEmpty";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppIcon, { type AppIconProps } from "../../components/AppIcon";
import AppView from "../../components/AppView";
import { BENEFICIARY_MANAGEMENT_CREATE_URL } from "../../constants/urls";
import useBeneficiaryManagementList from "../../hook/beneficiary_management/useBeneficiaryManagementList";
import { useTranslation } from "../../i18n/helper";
import type { BeneficiaryType } from "../../sql/types/beneficiaryType";
import { useThemeStore } from "../../stores/useThemeStore";
import BeneficiaryGridCard from "./_components/BeneficiaryGridCard";

type BeneficiaryRoute = Route & {
  key: "individual" | "group";
  title: string;
  type: BeneficiaryType;
};
const ROUTES: BeneficiaryRoute[] = [
  { key: "individual", title: "Individual", type: "INDIVIDUAL" },
  { key: "group", title: "Group", type: "GROUP" },
];

export default function BeneficiaryManagementList() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(type === "group" ? 1 : 0);
  useEffect(() => setIndex(type === "group" ? 1 : 0), [type]);
  const renderTabBar = (props: TabBarProps<BeneficiaryRoute>) => (
    <TabBar
      {...props}
      activeColor={THEME.primary}
      inactiveColor={THEME.outline}
      indicatorStyle={{ backgroundColor: THEME.primary }}
      style={{ backgroundColor: THEME.secondaryContainer }}
    />
  );
  return (
    <>
      <Stack.Screen options={{ title: t("Beneficiary Management") }} />
      <TabView
        navigationState={{
          index,
          routes: ROUTES.map((route) => ({ ...route, title: t(route.title) })),
        }}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        renderScene={({ route }) => <BeneficiaryTab route={route} />}
      />
    </>
  );
}

function BeneficiaryTab({ route }: { route: BeneficiaryRoute }) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const logic = useBeneficiaryManagementList(route.type);
  const isIndividual = route.type === "INDIVIDUAL";
  if (logic.isLoading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  return (
    <AppView className="relative bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <FlatList
        key={route.type}
        data={logic.beneficiaries}
        numColumns={isIndividual ? 3 : 1}
        columnWrapperStyle={isIndividual ? styles.gridRow : undefined}
        keyExtractor={(item) => item.id}
        refreshing={logic.isRefetching}
        onRefresh={() => void logic.onRefresh()}
        contentContainerStyle={[
          styles.content,
          isIndividual ? styles.gridContent : undefined,
        ]}
        ListEmptyComponent={<AppEmpty />}
        renderItem={({ item }) => {
          if (isIndividual)
            return (
              <BeneficiaryGridCard
                beneficiary={item}
                columns={3}
                highlightSelf
                variant="management"
                subtitle={
                  item.is_self ? t("Self") : (item.relationship ?? undefined)
                }
                onPress={() => logic.onPress(item.id)}
              />
            );

          const members = logic.membersByGroupId[item.id] ?? [];
          const visibleMembers =
            members.length > 3 ? members.slice(0, 2) : members;
          const remainingMemberCount = members.length - visibleMembers.length;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.name}${
                members.length
                  ? `, ${members.map((member) => member.name).join(", ")}`
                  : ""
              }${item.is_active ? "" : `, ${t("Inactive")}`}`}
              onPress={() => logic.onPress(item.id)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Surface
                elevation={1}
                style={[
                  styles.groupCard,
                  {
                    backgroundColor: THEME.surfaceContainer,
                    opacity: item.is_active ? 1 : 0.55,
                  },
                ]}
              >
                <View style={styles.groupIdentity}>
                  <View
                    style={[
                      styles.icon,
                      { backgroundColor: THEME.surfaceContainerHighest },
                    ]}
                  >
                    <AppIcon
                      name={item.icon as AppIconProps["name"]}
                      size={24}
                    />
                  </View>
                  <View style={styles.text}>
                    <Text variant="titleMedium" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: THEME.onSurfaceVariant }}
                    >
                      {t("Group")} ({members.length})
                    </Text>
                    {item.descriptions ? (
                      <Text
                        variant="labelSmall"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ color: THEME.onSurfaceVariant }}
                      >
                        {item.descriptions}
                      </Text>
                    ) : null}
                    {!item.is_active ? (
                      <Text
                        variant="labelMedium"
                        style={{ color: THEME.onSurfaceVariant }}
                      >
                        {t("Inactive")}
                      </Text>
                    ) : null}
                  </View>
                </View>
                {members.length ? (
                  <View style={styles.members}>
                    {visibleMembers.map((member) => (
                      <View
                        key={member.id}
                        style={[
                          styles.memberCard,
                          {
                            backgroundColor: THEME.surfaceContainerHigh,
                            borderColor: THEME.outlineVariant,
                            opacity: member.is_active ? 1 : 0.55,
                          },
                        ]}
                      >
                        <AppIcon
                          name={member.icon as AppIconProps["name"]}
                          size={14}
                          color={THEME.primary}
                        />
                        <Text
                          variant="labelMedium"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={styles.memberName}
                        >
                          {member.name}
                        </Text>
                      </View>
                    ))}
                    {remainingMemberCount ? (
                      <View
                        accessibilityLabel={`${t("Members")}: +${remainingMemberCount}`}
                        style={[
                          styles.memberCard,
                          styles.remainingMembers,
                          {
                            backgroundColor: THEME.primaryContainer,
                            borderColor: THEME.primary,
                          },
                        ]}
                      >
                        <Text
                          variant="labelMedium"
                          style={{ color: THEME.onPrimaryContainer }}
                        >
                          +{remainingMemberCount}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </Surface>
            </Pressable>
          );
        }}
      />
      <AppFloatingButton
        icon="plus"
        accessibilityLabel={t(
          route.type === "GROUP" ? "Add Group" : "Add Individual",
        )}
        onPress={() =>
          router.push({
            pathname: BENEFICIARY_MANAGEMENT_CREATE_URL,
            params: { type: route.key },
          })
        }
      />
    </AppView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 12, paddingBottom: 96 },
  gridContent: { gap: 8 },
  gridRow: { gap: 8 },
  groupCard: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    padding: 14,
  },
  groupIdentity: {
    alignItems: "center",
    flex: 1.25,
    flexDirection: "row",
    minWidth: 0,
  },
  icon: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  loading: { alignItems: "center", flex: 1, justifyContent: "center" },
  memberCard: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    minWidth: 60,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  memberName: { flex: 1, minWidth: 32 },
  members: {
    flex: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    minWidth: 0,
  },
  pressed: { opacity: 0.8 },
  remainingMembers: { flexDirection: "row", minWidth: 44 },
  text: { flex: 1, marginLeft: 10, minWidth: 0 },
});
