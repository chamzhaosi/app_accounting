package com.accounting.accounting.common.exception;

import com.accounting.accounting.common.enums.ExceptionEnum;

public class BadRequestException extends RuntimeException {
    private String errorCode;

    public BadRequestException(ExceptionEnum exceptionEnum) {
        super(exceptionEnum.getMessage());
        this.errorCode = exceptionEnum.name();
    }

    public BadRequestException(String message) {
        super(message);
    }
}