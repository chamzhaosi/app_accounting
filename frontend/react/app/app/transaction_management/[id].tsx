import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, View } from "react-native";
import { ActivityIndicator, SegmentedButtons } from "react-native-paper";
import AppAmtInput from "../../components/AppAmtInput";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDatePicker from "../../components/AppDatePicker";
import AppDialog from "../../components/AppDialog";
import AppIcon, { AppIconProps } from "../../components/AppIcon";
import { AppListCardItemType } from "../../components/AppListCardView";
import { AppListItemType } from "../../components/AppListView";
import AppScrollView from "../../components/AppScrollView";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import { AppToast } from "../../components/AppToast";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import {
  accountManagementQueryKeys,
  categoryManagementQueryKeys,
  invalidateQuery,
  transactionManagementQueryKeys,
} from "../../constants/queryKeys";
import {
  DIALOG_COMMON_BTN_PROPS,
  TEXTINPUT_HEIGHT,
} from "../../constants/size";
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
import {
  deleteTransactionMgmt,
  getTransactionMgmtById,
  updateTransactionMgmt,
} from "../../sql/service/transactionMgmtService";
import { DEBUG_TAG } from "../../utils/debugLog";
import AccountIdField, { AccountFieldName } from "./_components/AccountIdField";
import CategoryIdField from "./_components/CategoryIdField";

const CATEGORY_PAGE_SIZE = 40;
const ACCOUNT_PAGE_SIZE = 40;

const CATEGORY_TYPE_IDS: Record<
  TransactionManagementFormType["transactionType"],
  number | null
> = {
  [TXN_TYPE_ENUM.EXPENSE]: 2,
  [TXN_TYPE_ENUM.INCOME]: 1,
  [TXN_TYPE_ENUM.TRANSFER]: null,
  [TXN_TYPE_ENUM.ADJUSTMENT]: null,
};

export default function TransactionManagementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isAccountPickerVisible, setIsAccountPickerVisible] = useState(false);
  const [activeAccountField, setActiveAccountField] =
    useState<AccountFieldName>("accountId");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const reopenAccountPickerOnFocus = useRef(false);
  const refreshCategoriesOnFocus = useRef(false);
  const isSubmitting = isDeleting || isSaving;

  const {
    data: transaction,
    error: transactionError,
    isLoading: isLoadingTransaction,
  } = useQuery({
    queryKey: transactionManagementQueryKeys.detail(id),
    queryFn: () => getTransactionMgmtById(id),
    enabled: Boolean(id),
  });

  const {
    clearErrors,
    control,
    handleSubmit,
    reset,
    setFocus,
    setValue,
    watch,
  } = useForm<TransactionManagementFormType>({
    resolver: zodResolver(transactionManagementFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: getTransactionManagementFormDefaultValues(
      dayjs().format("YYYY-MM-DD"),
    ),
  });

  const transactionType = watch("transactionType");
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

  const categoryItems = useMemo<AppListCardItemType[]>(() => {
    const items =
      categories?.pages.flat().map((category) => ({
        id: category.id.toString(),
        icon: category.icon as AppIconProps["name"],
        label: category.label,
        description: category.descriptions ?? undefined,
      })) ?? [];
    const savedCategoryId = transaction?.category_id;

    if (
      !savedCategoryId ||
      transaction.transaction_type !== transactionType ||
      items.some((category) => category.id.toString() === savedCategoryId)
    ) {
      return items;
    }

    return [
      {
        id: savedCategoryId,
        icon: (transaction.category_icon ?? "Tag") as AppIconProps["name"],
        label: transaction.category_label ?? "Selected Category",
      },
      ...items,
    ];
  }, [categories, transaction, transactionType]);

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

  const onLoadMoreCategories = () => {
    if (isFetchingNextCategoryPage || !hasNextCategoryPage) return;
    fetchNextCategoryPage();
  };

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

  useEffect(() => {
    if (!transaction) return;

    reset({
      transactionType: transaction.transaction_type,
      categoryId: transaction.category_id ?? "",
      accountId: transaction.account_id ?? "",
      fromAccountId: transaction.from_account_id ?? "",
      toAccountId: transaction.to_account_id ?? "",
      amount: transaction.amount.toFixed(2),
      description: transaction.descriptions ?? "",
      transactionDate: transaction.transaction_date,
    });
  }, [reset, transaction]);

  useEffect(() => {
    if (!transactionError) return;
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when getting transaction detail",
      transactionError,
    );
  }, [transactionError]);

  useEffect(() => {
    if (isLoadingTransaction || transaction !== null) return;
    AppToast.error({ message: "Transaction not found." });
    router.back();
  }, [isLoadingTransaction, transaction]);

  const onSubmit = async (value: TransactionManagementFormType) => {
    try {
      Keyboard.dismiss();
      setResponseError("");
      setIsSaving(true);
      const errorMessage = await updateTransactionMgmt({
        ...value,
        id,
        description: value.description?.trim(),
      });

      if (errorMessage) {
        setResponseError(errorMessage);
        return;
      }

      await Promise.all([
        invalidateQuery(queryClient, transactionManagementQueryKeys.lists()),
        invalidateQuery(queryClient, transactionManagementQueryKeys.detail(id)),
        invalidateQuery(queryClient, accountManagementQueryKeys.all),
      ]);
      AppToast.success({ message: "Transaction updated successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.TRANSACTION_MANAGEMENT,
        "Error when updating transaction",
        e,
      );
      AppToast.error({ message: "Unable to update transaction." });
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      setResponseError("");
      setIsDeleting(true);
      const errorMessage = await deleteTransactionMgmt(id);

      if (errorMessage) {
        setResponseError(errorMessage);
        return;
      }

      await Promise.all([
        invalidateQuery(queryClient, transactionManagementQueryKeys.lists()),
        invalidateQuery(queryClient, accountManagementQueryKeys.all),
      ]);
      queryClient.removeQueries({
        queryKey: transactionManagementQueryKeys.detail(id),
      });
      AppToast.success({ message: "Transaction deleted successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.TRANSACTION_MANAGEMENT,
        "Error when deleting transaction",
        e,
      );
      AppToast.error({ message: "Unable to delete transaction." });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingTransaction) {
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex flex-1">
      <AppDialog
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction?"
        showDialog={showDeleteDialog}
        onDismiss={() => setShowDeleteDialog(false)}
        actionRender={
          <>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              onPress={() => setShowDeleteDialog(false)}
            >
              No
            </AppButton>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              variant={ButtonType.ERROR}
              onPress={() => {
                setShowDeleteDialog(false);
                void onDelete();
              }}
            >
              Yes
            </AppButton>
          </>
        }
      />

      <View className="p-4 pb-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
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

                if (selectedType === TXN_TYPE_ENUM.TRANSFER) {
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
                {
                  value: TXN_TYPE_ENUM.EXPENSE,
                  label: "Expense",
                  icon: "arrow-up",
                },
                {
                  value: TXN_TYPE_ENUM.INCOME,
                  label: "Income",
                  icon: "arrow-down",
                },
                {
                  value: TXN_TYPE_ENUM.TRANSFER,
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
                type: transactionType === TXN_TYPE_ENUM.INCOME ? "inc" : "exp",
              },
            });
          }}
        />
      </View>

      <AppScrollView
        className="p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer border-0 flex-1"
        contentContainerStyle={{ justifyContent: "flex-start" }}
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
          className={
            transactionType === TXN_TYPE_ENUM.TRANSFER ? undefined : "flex-row"
          }
        >
          {transactionType === TXN_TYPE_ENUM.TRANSFER ? (
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
                <AppIcon name="MoveRight" size={24} />
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

          <View
            className={
              transactionType === TXN_TYPE_ENUM.TRANSFER ? "" : "flex-1"
            }
          >
            <Controller
              control={control}
              name="amount"
              render={({
                field: { value, onChange, onBlur, ref },
                fieldState: { error },
              }) => (
                <AppAmtInput
                  ref={ref}
                  continerClassName="mb-4"
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
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          )}
        />

        {responseError && (
          <AppText type={TextTypEnum.ERROR}>{responseError}</AppText>
        )}

        <View className="flex-row items-center justify-center gap-4 mt-2 mb-4">
          <AppButton
            disabled={isSubmitting}
            loading={isDeleting}
            variant={ButtonType.ERROR}
            onPress={() => {
              Keyboard.dismiss();
              setShowDeleteDialog(true);
            }}
            style={{ flex: 1, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Delete
          </AppButton>
          <AppButton
            disabled={isSubmitting}
            loading={isSaving}
            onPress={handleSubmit(onSubmit)}
            style={{ flex: 0.4, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save
          </AppButton>
        </View>
      </AppScrollView>
    </View>
  );
}
