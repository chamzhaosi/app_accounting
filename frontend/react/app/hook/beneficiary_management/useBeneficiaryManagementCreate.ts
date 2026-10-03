import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AppToast } from "../../components/AppToast";
import {
  beneficiaryQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import { BENEFICIARY_MANAGEMENT_CREATE_URL } from "../../constants/urls";
import {
  beneficiaryFormDefaultValues,
  beneficiaryFormSchema,
  type BeneficiaryFormType,
} from "../../forms/schemas/beneficiary.schema";
import {
  createBeneficiary,
  getBeneficiaryList,
} from "../../sql/service/beneficiaryService";
import type { BeneficiaryType } from "../../sql/types/beneficiaryType";
import { DEBUG_TAG } from "../../utils/debugLog";
import { useTranslation } from "../../i18n/helper";

export default function useBeneficiaryManagementCreate() {
  const { type: requestedType } = useLocalSearchParams<{ type?: string }>();
  const type: BeneficiaryType =
    requestedType === "group" ? "GROUP" : "INDIVIDUAL";
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAndNew, setIsSavingAndNew] = useState(false);
  const [responseError, setResponseError] = useState("");
  const individualsQuery = useQuery({
    queryKey: beneficiaryQueryKeys.list({
      type: "INDIVIDUAL",
      includeInactive: false,
    }),
    queryFn: () => getBeneficiaryList("INDIVIDUAL", false),
    enabled: type === "GROUP",
  });
  const form = useForm<BeneficiaryFormType>({
    resolver: zodResolver(beneficiaryFormSchema),
    mode: "onChange",
    defaultValues: {
      ...beneficiaryFormDefaultValues,
      icon: type === "INDIVIDUAL" ? "CircleUserRound" : "UsersRound",
    },
  });
  const isSubmitting = isSaving || isSavingAndNew;

  useEffect(() => {
    form.reset({
      ...beneficiaryFormDefaultValues,
      icon: type === "INDIVIDUAL" ? "CircleUserRound" : "UsersRound",
    });
  }, [form, type]);

  const onSubmit = async (value: BeneficiaryFormType, saveAnother: boolean) => {
    const setLoading = saveAnother ? setIsSavingAndNew : setIsSaving;
    try {
      setResponseError("");
      setLoading(true);
      const errorMessage = await createBeneficiary({
        ...value,
        type,
        normalizedName: "",
        relationship: type === "INDIVIDUAL" ? value.relationship : undefined,
        memberIds: type === "GROUP" ? value.memberIds : [],
      });
      if (errorMessage) {
        setResponseError(errorMessage);
        return;
      }
      await invalidateQuery(queryClient, beneficiaryQueryKeys.all);
      AppToast.success({
        message: t(
          type === "INDIVIDUAL"
            ? "Individual created successfully"
            : "Group created successfully",
        ),
      });
      if (saveAnother) {
        form.reset({
          ...beneficiaryFormDefaultValues,
          icon: type === "INDIVIDUAL" ? "CircleUserRound" : "UsersRound",
        });
      } else router.back();
    } catch (error) {
      console.error(
        DEBUG_TAG.BENEFICIARY,
        "Unable to create beneficiary",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    ...form,
    type,
    individuals: individualsQuery.data ?? [],
    isSaving,
    isSavingAndNew,
    isSubmitting,
    responseError,
    onAddIndividual: () =>
      router.push({
        pathname: BENEFICIARY_MANAGEMENT_CREATE_URL,
        params: { type: "individual" },
      }),
    onSubmit,
  };
}
