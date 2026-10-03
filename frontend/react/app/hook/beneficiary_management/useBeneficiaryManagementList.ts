import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { beneficiaryQueryKeys } from "../../constants/queryKeys";
import { BENEFICIARY_MANAGEMENT_DETAIL_URL } from "../../constants/urls";
import { getBeneficiaryList } from "../../sql/service/beneficiaryService";
import type { BeneficiaryType } from "../../sql/types/beneficiaryType";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useBeneficiaryManagementList(type: BeneficiaryType) {
  const query = useQuery({
    queryKey: beneficiaryQueryKeys.list({ type, includeInactive: true }),
    queryFn: () => getBeneficiaryList(type, true),
  });
  const membersQuery = useQuery({
    queryKey: beneficiaryQueryKeys.list({
      type: "INDIVIDUAL",
      includeInactive: true,
    }),
    queryFn: () => getBeneficiaryList("INDIVIDUAL", true),
    enabled: type === "GROUP",
  });
  const membersByGroupId = useMemo(() => {
    if (type !== "GROUP") return {};
    const members = membersQuery.data ?? [];

    return Object.fromEntries(
      (query.data ?? []).map((group) => {
        const memberIds = new Set(group.member_ids);
        return [group.id, members.filter((member) => memberIds.has(member.id))];
      }),
    );
  }, [membersQuery.data, query.data, type]);

  useEffect(() => {
    const error = query.error ?? membersQuery.error;
    if (error)
      console.error(
        DEBUG_TAG.BENEFICIARY,
        "Unable to load beneficiary list",
        error,
      );
  }, [membersQuery.error, query.error]);

  return {
    beneficiaries: query.data ?? [],
    membersByGroupId,
    isLoading: query.isLoading || (type === "GROUP" && membersQuery.isLoading),
    isRefetching: query.isRefetching || membersQuery.isRefetching,
    onPress: (id: string) =>
      router.push({
        pathname: BENEFICIARY_MANAGEMENT_DETAIL_URL,
        params: { id },
      }),
    onRefresh: () =>
      type === "GROUP"
        ? Promise.all([query.refetch(), membersQuery.refetch()])
        : query.refetch(),
  };
}
