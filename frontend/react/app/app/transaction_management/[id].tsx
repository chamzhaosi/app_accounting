import dayjs from "dayjs";
import { Controller } from "react-hook-form";
import { Keyboard, View } from "react-native";
import { ActivityIndicator, SegmentedButtons } from "react-native-paper";
import AppAmtInput from "../../components/AppAmtInput";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDatePicker from "../../components/AppDatePicker";
import AppDialog from "../../components/AppDialog";
import AppIcon from "../../components/AppIcon";
import AppScrollView from "../../components/AppScrollView";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import {
  DIALOG_COMMON_BTN_PROPS,
  TEXTINPUT_HEIGHT,
} from "../../constants/size";
import {
  AMOUNT_MAX_LEN,
  DESCRIPTION_MAX_LEN,
} from "../../forms/schemas/transaction_management.schema";
import useTransactionManagementDetail from "../../hook/transaction_management/useTransactionManagementDetail";
import AccountIdField from "./_components/AccountIdField";
import CategoryIdField from "./_components/CategoryIdField";
import { useTranslation } from "../../i18n";

export default function TransactionManagementDetail() {
  const { t } = useTranslation();
  const {
    accountFieldProps,
    activeAccountField,
    categoryError,
    categoryItems,
    clearErrors,
    control,
    handleSubmit,
    isAccountPickerVisible,
    isDeleting,
    isFetchingNextCategoryPage,
    isLoadingCategories,
    isLoadingTransaction,
    isSaving,
    isSubmitting,
    onDelete,
    onLoadMoreCategories,
    onManageCategories,
    onSubmit,
    openAccountPicker,
    responseError,
    setFocus,
    setShowDeleteDialog,
    setValue,
    showDeleteDialog,
    transactionType,
  } = useTransactionManagementDetail();

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
          {t("Transaction Type")}
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
                  label: t("Expense"),
                  icon: "arrow-up",
                },
                {
                  value: TXN_TYPE_ENUM.INCOME,
                  label: t("Income"),
                  icon: "arrow-down",
                },
                {
                  value: TXN_TYPE_ENUM.TRANSFER,
                  label: t("Transfer"),
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
          onManageCategories={onManageCategories}
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
                  keyboardType="number-pad"
                  showClear
                  errorField={error}
                  fixedDecimalInput
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
