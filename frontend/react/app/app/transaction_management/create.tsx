import dayjs from "dayjs";
import { Controller } from "react-hook-form";
import { View } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import AppAmtInput from "../../components/AppAmtInput";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDatePicker from "../../components/AppDatePicker";
import AppIcon from "../../components/AppIcon";
import AppScrollView from "../../components/AppScrollView";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { TEXTINPUT_HEIGHT } from "../../constants/size";
import {
  AMOUNT_MAX_LEN,
  DESCRIPTION_MAX_LEN,
} from "../../forms/schemas/transaction_management.schema";
import useTransactionManagementCreate from "../../hook/transaction_management/useTransactionManagementCreate";
import AccountIdField from "./_components/AccountIdField";
import CategoryIdField from "./_components/CategoryIdField";
import { useTranslation } from "../../i18n/helper";

export default function TransactionManagementCreate() {
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
    isFetchingNextCategoryPage,
    isLoadingCategories,
    isSaving,
    isSavingAndNew,
    isSubmitting,
    onLoadMoreCategories,
    onManageCategories,
    onSubmit,
    openAccountPicker,
    responseError,
    setFocus,
    setValue,
    transactionType,
  } = useTransactionManagementCreate();

  return (
    <View className="flex flex-1">
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

                if (
                  (selectedType as TXN_TYPE_ENUM) === TXN_TYPE_ENUM.TRANSFER
                ) {
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
              onSubmitEditing={handleSubmit((value) => onSubmit(value, false))}
            />
          )}
        />

        {responseError && (
          <AppText type={TextTypEnum.ERROR}>{responseError}</AppText>
        )}

        <View className="flex-row items-center justify-center gap-4 mt-2 mb-4">
          <AppButton
            disabled={isSubmitting}
            loading={isSaving}
            variant={ButtonType.SECONDARY}
            onPress={handleSubmit((value) => onSubmit(value, false))}
            style={{ flex: 0.4, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save
          </AppButton>
          <AppButton
            disabled={isSubmitting}
            loading={isSavingAndNew}
            onPress={handleSubmit((value) => onSubmit(value, true))}
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
