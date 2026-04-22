package com.accounting.accounting.common.exception;

import com.accounting.accounting.common.enums.ExceptionEnum;
import lombok.Getter;

@Getter
public class InvalidArgumentException extends RuntimeException {
    private final String errorCode;

    public InvalidArgumentException(ExceptionEnum exceptionEnum) {
        super(exceptionEnum.getMessage());
        this.errorCode = exceptionEnum.name();
    }
}