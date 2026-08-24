import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AppToast } from "../../components/AppToast";
import {
  accountSettingsQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import {
  accountSettingsFormDefaultValues,
  accountSettingsFormSchema,
  type AccountSettingsFormType,
} from "../../forms/schemas/account_settings.schema";
import {
  getAccountSettings,
  saveAccountSettings,
} from "../../sql/service/accountSettingsService";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

export default function useAccountSettings() {
  const queryClient = useQueryClient();
  const currentLanguage = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const initialLanguage = useRef(currentLanguage);
  const [isSaving, setIsSaving] = useState(false);

  const {
    data: accountSettings,
    error,
    isFetched,
    isLoading,
  } = useQuery({
    queryKey: accountSettingsQueryKeys.detail(),
    queryFn: getAccountSettings,
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setFocus,
  } = useForm<AccountSettingsFormType>({
    resolver: zodResolver(accountSettingsFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      ...accountSettingsFormDefaultValues,
      language: currentLanguage,
    },
  });

  const onSubmit = async (value: AccountSettingsFormType) => {
    const data = {
      nickname: value.nickname.trim(),
      email: value.email.trim(),
      language: value.language,
    };

    try {
      setIsSaving(true);
      await saveAccountSettings(data);
      await setLanguage(data.language);
      await invalidateQuery(queryClient, accountSettingsQueryKeys.detail());
      debugLog(DEBUG_TAG.ACCOUNT_SETTINGS, "Account settings saved");
      AppToast.success({ message: "Account settings saved successfully" });
      return true;
    } catch (saveError) {
      console.error(
        DEBUG_TAG.ACCOUNT_SETTINGS,
        "Error when saving account settings",
        saveError,
      );
      AppToast.error({ message: "Unable to save account settings." });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isFetched) return;
    reset(
      accountSettings ?? {
        ...accountSettingsFormDefaultValues,
        language: initialLanguage.current,
      },
    );
  }, [accountSettings, isFetched, reset]);

  useEffect(() => {
    if (!error) return;
    console.error(
      DEBUG_TAG.ACCOUNT_SETTINGS,
      "Error when loading account settings",
      error,
    );
    AppToast.error({ message: "Unable to load account settings." });
  }, [error]);

  return {
    control,
    errors,
    handleSubmit,
    isLoading,
    isSaving,
    onSubmit,
    setFocus,
  };
}
