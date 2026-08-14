import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  accountManagementFormDefaultValues,
  accountManagementFormSchema,
  AccountManagementFormType,
  DESCRIPTION_MAX_LEN,
  INITIAL_VALUE_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../forms/schemas/account_management.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import AppSelect, { SelectOptionType } from "../../components/AppSelect";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppView from "../../components/AppView";
import AppTextInput from "../../components/AppTextInput";
import AppAmtInput from "../../components/AppAmtInput";
import AppSwitch from "../../components/AppSwitch";
import AppDivider from "../../components/AppDivider";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import { router, useLocalSearchParams } from "expo-router";
import AppDialog from "../../components/AppDialog";
import { DIALOG_COMMON_BTN_PROPS } from "../../constants/size";
import {
  accountManagementQueryKeys,
  accountTypeQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import {
  deleteAccMgmt,
  getAccMgmtById,
  updateAccMgmt,
} from "../../sql/service/accMgmtService";
import { getAccTypeList } from "../../sql/service/accTypeService";
import { AppIconProps } from "../../components/AppIcon";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { ActivityIndicator } from "react-native-paper";
import { AppToast } from "../../components/AppToast";
import { toTitleCase } from "../../utils/common";
import AppText, { TextTypEnum } from "../../components/AppText";

const ACCOUNT_TYPE_PAGE_SIZE = 100;

export default function AccountManagementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const isSubmitting = isDeleting || isSaving;

  const {
    data: account,
    error,
    isLoading,
  } = useQuery({
    queryKey: accountManagementQueryKeys.detail(id),
    queryFn: () => getAccMgmtById(id),
    enabled: Boolean(id),
  });

  const { data: accountTypes = [] } = useQuery({
    queryKey: accountTypeQueryKeys.list({ pageSize: ACCOUNT_TYPE_PAGE_SIZE }),
    queryFn: () => getAccTypeList(1, ACCOUNT_TYPE_PAGE_SIZE),
  });

  const { control, handleSubmit, reset, setFocus } =
    useForm<AccountManagementFormType>({
      resolver: zodResolver(accountManagementFormSchema),
      mode: "onChange",
      reValidateMode: "onChange",
      defaultValues: accountManagementFormDefaultValues,
    });

  const OPTIONS: SelectOptionType[] = accountTypes.map((item) => ({
    id: item.id,
    icon: item.icon as AppIconProps["name"],
    label: item.label,
    value: item.id,
  }));

  const onSubmit = async (value: AccountManagementFormType) => {
    const data = {
      ...value,
      id,
      label: value.label,
      descriptions: value.descriptions?.trim(),
    };

    try {
      setRspErrorMsg("");
      setIsSaving(true);
      const exist = await updateAccMgmt(data);
      if (exist) {
        debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Update rejected by service", {
          id,
          label: data.label,
          reason: exist,
        });
        setRspErrorMsg(exist);
        return;
      }

      await Promise.all([
        invalidateQuery(queryClient, accountManagementQueryKeys.lists()),
        invalidateQuery(queryClient, accountManagementQueryKeys.detail(id)),
      ]);
      debugLog(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Invalidated account queries after update",
        { id },
      );
      AppToast.success({ message: "Account updated successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Error when updating account",
        e,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAccMgmt(id);
      await invalidateQuery(queryClient, accountManagementQueryKeys.lists());
      queryClient.removeQueries({
        queryKey: accountManagementQueryKeys.detail(id),
      });
      debugLog(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Invalidated list and removed detail after delete",
        { id },
      );
      AppToast.success({ message: "Account deleted successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Error when deleting account",
        e,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!account) return;

    reset({
      typeId: account.type_id,
      label: account.label,
      descriptions: account.descriptions ?? "",
      initialValue: account.initial_value.toFixed(2),
      isMainAccount: Boolean(account.is_main_account),
    });
  }, [account, reset]);

  useEffect(() => {
    if (isLoading || account !== null) return;

    console.warn("Account id not found", { id });
    AppToast.error({ message: "Account id not found" });
  }, [account, id, isLoading]);

  useEffect(() => {
    if (!error) return;

    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when getting account by id",
      error,
    );
  }, [error]);

  if (isLoading)
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size={"large"} />
      </View>
    );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView
        isSafe
        edges={["bottom", "left", "left"]}
        className="p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer"
      >
        <AppDialog
          title="Delete"
          description="Are you sure you want to delete this account?
                  Transactions associated with this account will not be affected."
          showDialog={showDialog}
          onDismiss={() => setShowDialog(false)}
          actionRender={
            <>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                onPress={() => setShowDialog(false)}
              >
                No
              </AppButton>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                variant={ButtonType.ERROR}
                onPress={() => {
                  setShowDialog(false);
                  onDelete();
                }}
              >
                Yes
              </AppButton>
            </>
          }
        />
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
              onSubmitEditing={() => setFocus("initialValue")}
            />
          )}
        />

        <Controller
          control={control}
          name="initialValue"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppAmtInput
              ref={ref}
              mode="outlined"
              label="Capital Value"
              disabled={isSubmitting}
              keyboardType="number-pad"
              onChangeText={onChange}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              maxLength={INITIAL_VALUE_MAX_LEN}
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
            loading={isDeleting}
            onPress={() => {
              Keyboard.dismiss();
              setShowDialog(true);
            }}
            variant={ButtonType.ERROR}
            style={{ flex: 1, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Delete
          </AppButton>
          <AppButton
            disabled={isSubmitting}
            loading={isSaving}
            onPress={() => {
              Keyboard.dismiss();
              handleSubmit(onSubmit)();
            }}
            variant={ButtonType.PRIMARY}
            style={{ flex: 0.4, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save
          </AppButton>
        </View>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
