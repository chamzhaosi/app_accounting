import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AppToast } from "../../components/AppToast";
import {
  beneficiaryQueryKeys,
  budgetQueryKeys,
  invalidateQuery,
  transactionManagementQueryKeys,
  transactionSearchQueryKeys,
} from "../../constants/queryKeys";
import { BENEFICIARY_MANAGEMENT_CREATE_URL } from "../../constants/urls";
import {
  beneficiaryFormDefaultValues,
  beneficiaryFormSchema,
  type BeneficiaryFormType,
} from "../../forms/schemas/beneficiary.schema";
import {
  getBeneficiaryById,
  getBeneficiaryList,
  updateBeneficiary,
} from "../../sql/service/beneficiaryService";
import { DEBUG_TAG } from "../../utils/debugLog";
import { useTranslation } from "../../i18n/helper";

export default function useBeneficiaryManagementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [responseError, setResponseError] = useState("");
  const beneficiaryQuery = useQuery({
    queryKey: beneficiaryQueryKeys.detail(id),
    queryFn: () => getBeneficiaryById(id),
    enabled: Boolean(id),
  });
  const individualsQuery = useQuery({
    queryKey: beneficiaryQueryKeys.list({
      type: "INDIVIDUAL",
      includeInactive: true,
    }),
    queryFn: () => getBeneficiaryList("INDIVIDUAL", true),
  });
  const form = useForm<BeneficiaryFormType>({
    resolver: zodResolver(beneficiaryFormSchema),
    mode: "onChange",
    defaultValues: beneficiaryFormDefaultValues,
  });
  const beneficiary = beneficiaryQuery.data;

  useEffect(() => {
    if (!beneficiary) return;
    form.reset({
      icon: beneficiary.icon,
      name: beneficiary.name,
      relationship: beneficiary.relationship ?? "",
      descriptions: beneficiary.descriptions ?? "",
      isActive: beneficiary.is_active,
      memberIds: beneficiary.member_ids,
    });
  }, [beneficiary, form]);

  const onSubmit = async (value: BeneficiaryFormType) => {
    if (!beneficiary) return;
    try {
      setResponseError("");
      setIsSaving(true);
      const errorMessage = await updateBeneficiary({
        ...value,
        id: beneficiary.id,
        type: beneficiary.type,
        normalizedName: "",
        isActive: beneficiary.is_self ? true : value.isActive,
        memberIds: beneficiary.type === "GROUP" ? value.memberIds : [],
      });
      if (errorMessage) {
        setResponseError(errorMessage);
        return;
      }
      await Promise.all([
        invalidateQuery(queryClient, beneficiaryQueryKeys.all),
        invalidateQuery(queryClient, budgetQueryKeys.all),
        invalidateQuery(queryClient, transactionManagementQueryKeys.all),
        invalidateQuery(queryClient, transactionSearchQueryKeys.all),
      ]);
      AppToast.success({ message: t("Beneficiary updated successfully") });
      router.back();
    } catch (error) {
      console.error(
        DEBUG_TAG.BENEFICIARY,
        "Unable to update beneficiary",
        error,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    ...form,
    beneficiary,
    individuals: individualsQuery.data ?? [],
    isLoading: beneficiaryQuery.isLoading,
    isSaving,
    responseError,
    onAddIndividual: () =>
      router.push({
        pathname: BENEFICIARY_MANAGEMENT_CREATE_URL,
        params: { type: "individual" },
      }),
    onSubmit,
  };
}
