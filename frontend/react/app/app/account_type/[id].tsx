import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDialog from "../../components/AppDialog";
import AppDivider from "../../components/AppDivider";
import AppIcon, { AppIconProps } from "../../components/AppIcon";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import { ICONS } from "../../constants/icons";
import { DIALOG_COMMON_BTN_PROPS } from "../../constants/size";
import {
  accountTypeFormDefaultValues,
  accountTypeFormSchema,
  AccountTypeFormType,
  LABEL_MAX_LEN,
} from "../../forms/schemas/accout_type.schema";
import { useThemeStore } from "../../stores/useThemeStore";
import AccTypeIconsList from "./_components/AccTypeIconsList";
import {
  deleteAccType,
  getAccTypeById,
  updateAccType,
} from "../../sql/service/accTypeService";
import { AppToast } from "../../components/AppToast";
import { toTitleCase } from "../../utils/common";
import { ActivityIndicator } from "react-native-paper";
import { accountTypeQueryKeys, invalidateQuery } from "../../constants/queryKeys";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

export default function AccountTypeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { THEME } = useThemeStore();
  const queryClient = useQueryClient();

  const [selectedItem, setSelectedItem] = useState<AppIconProps["name"]>(
    ICONS.ACCOUNT_TYPE[0],
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const isSubmitting = isDeleting || isSaving;

  const {
    data: accType,
    error,
    isLoading,
  } = useQuery({
    queryKey: accountTypeQueryKeys.detail(id),
    queryFn: () => getAccTypeById(id),
    enabled: Boolean(id),
  });

  const { control, handleSubmit, reset } = useForm<AccountTypeFormType>({
    resolver: zodResolver(accountTypeFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: accountTypeFormDefaultValues,
  });

  const onSubmit = async (value: AccountTypeFormType) => {
    const data = {
      ...value,
      id: id,
      label: toTitleCase(value.label),
      icon: selectedItem,
    };

    try {
      setRspErrorMsg("");
      setIsSaving(true);
      const exist = await updateAccType(data);
      if (exist) {
        debugLog(DEBUG_TAG.ACCOUNT_TYPE, "Update rejected by service", {
          id,
          label: data.label,
          reason: exist,
        });
        setRspErrorMsg(exist);
      } else {
        await Promise.all([
          invalidateQuery(queryClient, accountTypeQueryKeys.lists()),
          invalidateQuery(queryClient, accountTypeQueryKeys.detail(id)),
        ]);
        debugLog(
          DEBUG_TAG.ACCOUNT_TYPE,
          "Invalidated account type queries after update",
          {
            id,
          },
        );
        AppToast.success({
          message: `Account type updated successfully`,
        });
        router.back();
      }
    } catch (e) {
      console.error(
        DEBUG_TAG.ACCOUNT_TYPE,
        "Error when updating account type",
        e,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAccType(id);
      await invalidateQuery(queryClient, accountTypeQueryKeys.lists());
      queryClient.removeQueries({
        queryKey: accountTypeQueryKeys.detail(id),
      });
      debugLog(
        DEBUG_TAG.ACCOUNT_TYPE,
        "Invalidated list and removed detail after delete",
        {
          id,
        },
      );
      AppToast.success({
        message: `Account type deleted successfully`,
      });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.ACCOUNT_TYPE,
        "Error when deleting account type",
        e,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!accType) return;

    reset({
      label: accType.label,
      icon: accType.icon,
    });
    setSelectedItem(accType.icon as AppIconProps["name"]);
  }, [accType, reset]);

  useEffect(() => {
    if (isLoading || accType !== null) return;

    console.warn("Account type id not found", { id });
    AppToast.error({ message: "Accout type id not found" });
  }, [accType, id, isLoading]);

  useEffect(() => {
    if (!error) return;

    console.error(
      DEBUG_TAG.ACCOUNT_TYPE,
      "Error when getting account type by id",
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
      <AppView>
        <AppDialog
          title="Delete"
          description="Are you sure you want to delete this account type?
          Accounts associated with this type will not be affected."
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
        <View className="flex-row justify-around px-4 pt-2 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
          <View
            className="items-center justify-center p-4 rounded-lg mr-4 mt-2
            bg-LIGHT-tertiary dark:bg-DARK-tertiary"
          >
            <AppIcon name={selectedItem} size={48} color={THEME.onTertiary} />
          </View>

          <View className="flex-1 justify-center">
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
                  label={"Label"}
                  editable={!isSubmitting}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  maxLength={LABEL_MAX_LEN}
                  showClear
                  errorField={error}
                />
              )}
            />
          </View>
        </View>

        <View className="m-4 mt-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
          <View className="flex-row items-center justify-center gap-4 mt-4">
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
              variant={ButtonType.SECONDARY}
              style={{ flex: 0.4, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Update
            </AppButton>
          </View>

          {rspErrorMsg && (
            <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
          )}
        </View>

        <AppDivider />

        <AccTypeIconsList
          setSelectedItem={setSelectedItem}
          selectedItem={selectedItem}
        />
      </AppView>
    </TouchableWithoutFeedback>
  );
}
