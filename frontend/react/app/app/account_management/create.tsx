import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppAmtInput from "../../components/AppAmtInput";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDivider from "../../components/AppDivider";
import { AppIconProps } from "../../components/AppIcon";
import AppScrollView from "../../components/AppScrollView";
import AppSelect, { SelectOptionType } from "../../components/AppSelect";
import AppSwitch from "../../components/AppSwitch";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import { AppToast } from "../../components/AppToast";
import {
  accountManagementQueryKeys,
  accountTypeQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import {
  accountManagementFormDefaultValues,
  accountManagementFormSchema,
  AccountManagementFormType,
  DESCRIPTION_MAX_LEN,
  CURRENT_BALANCE_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../forms/schemas/account_management.schema";
import { createNewAccMgmt } from "../../sql/service/accMgmtService";
import { getAccTypeList } from "../../sql/service/accTypeService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

const ACCOUNT_TYPE_PAGE_SIZE = 100;

export default function AccountManagementCreate() {
  const queryClient = useQueryClient();

  const [isSavingAndNewAcc, setIsSavingAndNewAcc] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");
  const isSubmitting = isSavingAndNewAcc || isSaving;

  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<AccountManagementFormType>({
    resolver: zodResolver(accountManagementFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: accountManagementFormDefaultValues,
  });

  const { data: accountTypes = [] } = useQuery({
    queryKey: accountTypeQueryKeys.list({ pageSize: ACCOUNT_TYPE_PAGE_SIZE }),
    queryFn: () => getAccTypeList(1, ACCOUNT_TYPE_PAGE_SIZE),
  });

  const OPTIONS: SelectOptionType[] = accountTypes.map((item) => ({
    id: item.id,
    icon: item.icon as AppIconProps["name"],
    label: item.label,
    value: item.id,
  }));

  const onSubmit = async (
    value: AccountManagementFormType,
    saveAnotherAcc: boolean,
  ) => {
    const setLoading = saveAnotherAcc ? setIsSavingAndNewAcc : setIsSaving;
    const data = {
      ...value,
      label: value.label,
      descriptions: value.descriptions?.trim(),
    };

    try {
      setRspErrorMsg("");
      setLoading(true);
      const errMsg = await createNewAccMgmt(data);
      if (errMsg) {
        debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Create rejected by service", {
          label: data.label,
          reason: errMsg,
        });
        setRspErrorMsg(errMsg);
        return;
      }

      await Promise.all([
        invalidateQuery(queryClient, accountManagementQueryKeys.lists()),
        invalidateQuery(queryClient, accountManagementQueryKeys.mainBalance()),
      ]);
      debugLog(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Invalidated account lists after create",
        {
          label: data.label,
        },
      );
      AppToast.success({
        message: `${value.label} account created successfully`,
      });
      reset();
      if (!saveAnotherAcc) router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Error when create new account",
        e,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppScrollView
        className="p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer"
        contentContainerStyle={{ justifyContent: "flex-start" }}
      >
        <Controller
          control={control}
          name="typeId"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppSelect
              ref={ref}
              label="Account Type"
              value={value?.toString() ?? ""}
              onChange={onChange}
              onBlur={onBlur}
              options={OPTIONS}
              errorField={error}
              disabled={isSubmitting}
              showClear
            />
          )}
        />
        <Controller
          control={control}
          name="label"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppTextInput
              ref={ref}
              mode="outlined"
              label="Label"
              disabled={isSubmitting}
              onChangeText={onChange}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              maxLength={LABEL_MAX_LEN}
              showClear
              errorField={error}
              submitBehavior="submit"
              onSubmitEditing={() => setFocus("descriptions")}
            />
          )}
        />

        <Controller
          control={control}
          name="descriptions"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppTextInput
              ref={ref}
              mode="outlined"
              label="Descriptions"
              numberOfLines={3}
              multiline
              disabled={isSubmitting}
              onChangeText={onChange}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              maxLength={DESCRIPTION_MAX_LEN}
              showClear
              errorField={error}
              submitBehavior="submit"
              onSubmitEditing={() => setFocus("currentBalance")}
            />
          )}
        />

        <Controller
          control={control}
          name="currentBalance"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppAmtInput
              ref={ref}
              mode="outlined"
              label="Current Balance"
              disabled={isSubmitting}
              keyboardType="number-pad"
              onChangeText={onChange}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              maxLength={CURRENT_BALANCE_MAX_LEN}
              showClear
              errorField={error}
            />
          )}
        />

        <Controller
          control={control}
          name="isMainAccount"
          render={({ field: { value, onChange, ref } }) => (
            <AppSwitch
              ref={ref}
              label="Main Account"
              disabled={isSubmitting}
              value={value}
              onValueChange={onChange}
            />
          )}
        />
        <AppDivider />
        {rspErrorMsg && (
          <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
        )}
        <View className="flex-row items-center justify-center gap-4 mt-6">
          <AppButton
            disabled={isSubmitting}
            loading={isSaving}
            variant={ButtonType.SECONDARY}
            onPress={() => {
              Keyboard.dismiss();
              handleSubmit((value) => onSubmit(value, false))();
            }}
            style={{ flex: 0.4, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save
          </AppButton>
          <AppButton
            disabled={isSubmitting}
            loading={isSavingAndNewAcc}
            onPress={() => {
              !errors.label && Keyboard.dismiss();
              handleSubmit((value) => onSubmit(value, true))();
            }}
            style={{ flex: 1, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save & New
          </AppButton>
        </View>
      </AppScrollView>
    </TouchableWithoutFeedback>
  );
}
