import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, View } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import AppAmtInput from "../../components/AppAmtInput";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDatePicker from "../../components/AppDatePicker";
import AppIcon, { AppIconProps } from "../../components/AppIcon";
import { AppListCardItemType } from "../../components/AppListCardView";
import { AppListItemType } from "../../components/AppListView";
import AppScrollView from "../../components/AppScrollView";
import AppText from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import { AppToast } from "../../components/AppToast";
import {
  accountManagementQueryKeys,
  categoryManagementQueryKeys,
} from "../../constants/queryKeys";
import { TEXTINPUT_HEIGHT } from "../../constants/size";
import {
  ACCOUNT_MANAGEMENT_LIST_URL,
  CATEGORY_MANAGEMENT_LIST_URL,
} from "../../constants/urls";
import {
  AMOUNT_MAX_LEN,
  DESCRIPTION_MAX_LEN,
  getTransactionManagementFormDefaultValues,
  transactionManagementFormSchema,
  TransactionManagementFormType,
} from "../../forms/schemas/transaction_management.schema";
import { getAccMgmtList } from "../../sql/service/accMgmtService";
import { getCategoryMgmtList } from "../../sql/service/categoryMgmtService";
import AccountIdField, { AccountFieldName } from "./_components/AccountIdField";
import CategoryIdField from "./_components/CategoryIdField";

const CATEGORY_PAGE_SIZE = 40;
const ACCOUNT_PAGE_SIZE = 40;

const CATEGORY_TYPE_IDS: Record<
  TransactionManagementFormType["transactionType"],
  number | null
> = {
  expense: 2,
  income: 1,
  transfer: null,
};

export default function TransactionManagementCreate() {
  const [isAccountPickerVisible, setIsAccountPickerVisible] =
    useState<boolean>(false);
  const [activeAccountField, setActiveAccountField] =
    useState<AccountFieldName>("accountId");
  const reopenAccountPickerOnFocus = useRef(false);
  const refreshCategoriesOnFocus = useRef(false);

  const today = dayjs().format("YYYY-MM-DD");
  const { clearErrors, control, handleSubmit, setFocus, setValue, watch } =
    useForm<TransactionManagementFormType>({
      resolver: zodResolver(transactionManagementFormSchema),
      mode: "onChange",
      reValidateMode: "onChange",
      defaultValues: getTransactionManagementFormDefaultValues(today),
    });

  const transactionType = watch("transactionType");
  const categoryId = watch("categoryId");
  const categoryTypeId = CATEGORY_TYPE_IDS[transactionType];

  const {
    data: categories,
    error: categoryError,
    fetchNextPage: fetchNextCategoryPage,
    hasNextPage: hasNextCategoryPage,
    isFetchingNextPage: isFetchingNextCategoryPage,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useInfiniteQuery({
    queryKey: categoryManagementQueryKeys.list({
      typeId: categoryTypeId ?? 0,
      pageSize: CATEGORY_PAGE_SIZE,
    }),
    queryFn: ({ pageParam }) =>
      getCategoryMgmtList(categoryTypeId!, pageParam, CATEGORY_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === CATEGORY_PAGE_SIZE ? allPages.length + 1 : undefined,
    enabled: categoryTypeId !== null,
  });

  const {
    data: accounts,
    error: accountError,
    fetchNextPage: fetchNextAccountPage,
    hasNextPage: hasNextAccountPage,
    isFetchingNextPage: isFetchingNextAccountPage,
    isLoading: isLoadingAccounts,
    isRefetching: isRefetchingAccounts,
    refetch: refetchAccounts,
  } = useInfiniteQuery({
    queryKey: accountManagementQueryKeys.list({
      pageSize: ACCOUNT_PAGE_SIZE,
    }),
    queryFn: ({ pageParam }) => getAccMgmtList(pageParam, ACCOUNT_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === ACCOUNT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const categoryItems = useMemo<AppListCardItemType[]>(
    () =>
      categories?.pages.flat().map((category) => ({
        id: category.id.toString(),
        icon: category.icon as AppIconProps["name"],
        label: category.label,
        description: category.descriptions ?? undefined,
      })) ?? [],
    [categories],
  );

  const onLoadMoreCategories = () => {
    if (isFetchingNextCategoryPage || !hasNextCategoryPage) return;

    fetchNextCategoryPage();
  };

  const accountItems = useMemo<AppListItemType[]>(
    () =>
      accounts?.pages.flat().map((account) => ({
        id: account.id,
        icon: account.type_icon as AppIconProps["name"],
        label: account.label,
        descriptions: account.descriptions ?? undefined,
      })) ?? [],
    [accounts],
  );

  const onLoadMoreAccounts = () => {
    if (isFetchingNextAccountPage || !hasNextAccountPage) return;

    fetchNextAccountPage();
  };

  const openAccountPicker = (fieldName: AccountFieldName) => {
    setActiveAccountField(fieldName);
    setIsAccountPickerVisible(true);
  };

  const onManageAccounts = () => {
    reopenAccountPickerOnFocus.current = true;
    setIsAccountPickerVisible(false);
    router.push(ACCOUNT_MANAGEMENT_LIST_URL);
  };

  const accountFieldProps = {
    accountItems,
    control,
    error: accountError,
    isFetchingNextPage: isFetchingNextAccountPage,
    isLoading: isLoadingAccounts,
    isRefreshing: isRefetchingAccounts,
    onDismissPicker: () => setIsAccountPickerVisible(false),
    onLoadMore: onLoadMoreAccounts,
    onManageAccounts,
    onRefresh: refetchAccounts,
  };

  useFocusEffect(
    useCallback(() => {
      if (reopenAccountPickerOnFocus.current) {
        reopenAccountPickerOnFocus.current = false;
        setIsAccountPickerVisible(true);
        void refetchAccounts();
      }

      if (refreshCategoriesOnFocus.current) {
        refreshCategoriesOnFocus.current = false;
        void refetchCategories();
      }
    }, [refetchAccounts, refetchCategories]),
  );

  const onSubmit = (_value: TransactionManagementFormType) => {
    Keyboard.dismiss();
    AppToast.info({
      title: "Transaction",
      message: "Transaction persistence is not implemented. Nothing was saved.",
    });
  };

  useEffect(() => {
    if (isLoadingCategories || categoryError || transactionType === "transfer")
      return;

    if (!categoryItems.length) {
      if (categoryId) setValue("categoryId", "", { shouldValidate: true });
      return;
    }

    const isSelectedCategoryAvailable = categoryItems.some(
      (category) => category.id.toString() === categoryId,
    );
    if (isSelectedCategoryAvailable) return;

    setValue("categoryId", categoryItems[0].id.toString());
  }, [
    categoryError,
    categoryId,
    categoryItems,
    isLoadingCategories,
    setValue,
    transactionType,
  ]);

  return (
    <View className="flex flex-1">
      <View
        className={`p-4 pb-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer flex-1}`}
      >
        <AppText variant="titleMedium" className="mb-2">
          Transaction Type
        </AppText>
        <Controller
          control={control}
          name="transactionType"
          render={({ field: { value, onChange } }) => (
            <SegmentedButtons
              value={value}
              onValueChange={(selectedType) => {
                onChange(selectedType);
                setValue("categoryId", "");

                if (selectedType === "transfer") {
                  setValue("accountId", "");
                } else {
                  setValue("fromAccountId", "");
                  setValue("toAccountId", "");
                }

                clearErrors([
                  "accountId",
                  "fromAccountId",
                  "toAccountId",
                  "categoryId",
                ]);
              }}
              buttons={[
                { value: "expense", label: "Expense", icon: "arrow-up" },
                { value: "income", label: "Income", icon: "arrow-down" },
                {
                  value: "transfer",
                  label: "Transfer",
                  icon: "swap-horizontal",
                },
              ]}
            />
          )}
        />

        <CategoryIdField
          control={control}
          transactionType={transactionType}
          categoryItems={categoryItems}
          error={categoryError}
          isLoading={isLoadingCategories}
          isFetchingNextPage={isFetchingNextCategoryPage}
          onLoadMore={onLoadMoreCategories}
          onManageCategories={() => {
            refreshCategoriesOnFocus.current = true;
            router.push({
              pathname: CATEGORY_MANAGEMENT_LIST_URL,
              params: {
                type: transactionType === "income" ? "inc" : "exp",
              },
            });
          }}
        />
      </View>
      <AppScrollView
        className="p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer border-0 flex-1"
        contentContainerStyle={{
          justifyContent: "flex-start",
        }}
      >
        <Controller
          control={control}
          name="transactionDate"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppDatePicker
              ref={ref}
              mode="outlined"
              label="Transaction Date"
              value={dayjs(value).toDate()}
              onChange={(date) => onChange(dayjs(date).format("YYYY-MM-DD"))}
              onBlur={onBlur}
              errorField={error}
            />
          )}
        />

        <View
          className={transactionType === "transfer" ? undefined : "flex-row"}
        >
          {transactionType === "transfer" ? (
            <View className="flex-row items-center">
              <AccountIdField
                {...accountFieldProps}
                fieldName="fromAccountId"
                label="From Account"
                isPickerVisible={
                  isAccountPickerVisible &&
                  activeAccountField === "fromAccountId"
                }
                onOpenPicker={() => openAccountPicker("fromAccountId")}
              />

              <View
                className="px-2 pb-2 items-center justify-center"
                style={{ height: TEXTINPUT_HEIGHT }}
              >
                <AppIcon name="ArrowLeftRight" size={24} />
              </View>

              <AccountIdField
                {...accountFieldProps}
                fieldName="toAccountId"
                label="To Account"
                isPickerVisible={
                  isAccountPickerVisible && activeAccountField === "toAccountId"
                }
                onOpenPicker={() => openAccountPicker("toAccountId")}
                showQueryError={false}
              />
            </View>
          ) : (
            <AccountIdField
              {...accountFieldProps}
              fieldName="accountId"
              label="Account"
              isPickerVisible={
                isAccountPickerVisible && activeAccountField === "accountId"
              }
              onOpenPicker={() => openAccountPicker("accountId")}
            />
          )}

          <View className={transactionType === "transfer" ? "" : "flex-1"}>
            <Controller
              control={control}
              name="amount"
              render={({
                field: { value, onChange, onBlur, ref },
                fieldState: { error },
              }) => (
                <AppAmtInput
                  ref={ref}
                  continerClassName={"mb-4"}
                  mode="outlined"
                  label="Amount"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxLength={AMOUNT_MAX_LEN}
                  keyboardType="decimal-pad"
                  showClear
                  errorField={error}
                  selectTextOnFocus
                  returnKeyType="next"
                  onSubmitEditing={() => setFocus("description")}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="description"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppTextInput
              ref={ref}
              mode="outlined"
              label="Description"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={DESCRIPTION_MAX_LEN}
              numberOfLines={3}
              multiline
              showClear
              errorField={error}
              submitBehavior="submit"
              onSubmitEditing={handleSubmit((value) => onSubmit(value))}
            />
          )}
        />

        <View className="flex-row items-center justify-center gap-4 mt-2 mb-4">
          <AppButton
            variant={ButtonType.SECONDARY}
            onPress={handleSubmit(onSubmit)}
            style={{ flex: 0.4, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save
          </AppButton>
          <AppButton
            onPress={handleSubmit(onSubmit)}
            style={{ flex: 1, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save & New
          </AppButton>
        </View>
      </AppScrollView>
    </View>
  );
}
