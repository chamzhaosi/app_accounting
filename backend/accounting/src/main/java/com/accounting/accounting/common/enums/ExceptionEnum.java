package com.accounting.accounting.common.enums;

import lombok.Getter;

@Getter
public enum ExceptionEnum {
    // User authenticate exception
    EMAIL_EXIST_IN_DB("The email address is already registered in our system."),
    ENCODE_USER_PASSWORD_BUT_GET_NULL_VALUE("Encoding user password but get null."),
    ENCODE_REFRESH_TOKEN_BUT_GET_NULL_VALUE("Encoding user password but get null."),
    INVALID_LOGIN_CREDENTIAL("Email or password is incorrect."),
    INVALID_RESET_PASSWORD_TOKEN("Reset password token is invalid."),
    INVALID_RESET_CURRENT_PASSWORD("Current password is incorrect."),
    NOT_FOUND_CURRENT_PASSWORD("Not found current password"),
    INVALID_REFRESH_TOKEN("Refresh token is invalid."),
    INVALID_ACCESS_TOKEN("Access token is invalid"),
    INCORRECT_JWT_USERINFO("User or password not found."),
    INVALID_AUTHENTICATION("Unauthorized"),
    DATA_STALE("The data is outdated. Please refresh and try again."),

    // Transaction
    TXN_TYPE_ID_NOT_FOUND_OR_INVALID("Transaction type not found or invalid"),
    TXN_TYPE_NOT_SUPPORTED("Transaction type not supported"),
    TSF_GROUP_TXN_ID_NOT_FOUND("Not found transfer transaction record"),
    TXN_TYPE_AND_CTGR_NOT_MATCH("Transaction type and category are not matched"),
    BOTH_TXN_DATA_MUST_BE_EQUAL("The amount, description, and transaction date must be the same for both transfer records."),

    // CATEGORY
    CTGR_ID_NOT_FOUND_OR_INVALID("Category type not found or invalid"),

    // Account
    ACC_TYPE_ID_NOT_FOUND_OR_INVALID("Account type not found or invalid"),
    ACC_ID_NOT_FOUND_OR_INVALID("Account not found or invalid"),

    // Budget
    BUDGET_IS_EXISTING("Budget has been created, please use '/update' api to update details"),

    // Common exception
    DUPLICATE_DATA_FOUND("Data has been exist in our system."),
    DATA_NOT_FOUND("Data not found."),
    DATA_NOT_ALLOWED_TO_BE_MODIFIED("Data is not allowed to be modified by the user."),
    INVALID_ARGUMENT("Invalid required data"),
    UNKNOWN_ERROR("Unknown error");

    private final String message;
    ExceptionEnum(String message){
        this.message = message;
    }


}
