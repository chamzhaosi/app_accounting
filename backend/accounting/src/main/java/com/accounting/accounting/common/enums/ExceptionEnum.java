package com.accounting.accounting.common.enums;

import lombok.Getter;

@Getter
public enum ExceptionEnum {
    EMAIL_EXIST_IN_DB("The email address is already registered in our system."),
    ENCODE_USER_PASSWORD_BUT_GET_NULL_VALUE("Encoding user password but get null."),
    ENCODE_REFRESH_TOKEN_BUT_GET_NULL_VALUE("Encoding user password but get null."),
    INVALID_LOGIN_CREDENTIAL("Email or password is incorrect."),
    INVALID_RESET_PASSWORD_TOKEN("Reset password token is invalid"),
    INVALID_REFRESH_TOKEN("Refresh token is invalid"),
    INCORRECT_JWT_USERINFO("User or password not found"),
    UNKNOWN_ERROR("Unknown error");

    private final String message;
    ExceptionEnum(String message){
        this.message = message;
    }


}
