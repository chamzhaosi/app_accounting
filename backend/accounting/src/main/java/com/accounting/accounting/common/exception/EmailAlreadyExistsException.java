package com.accounting.accounting.common.exception;

import com.accounting.accounting.common.enums.ExceptionEnum;

public class EmailAlreadyExistsException extends RuntimeException {
    private static final String DEFAULT_MESSAGE =
            ExceptionEnum.EMAIL_EXIST_IN_DB.getMessage();

    public EmailAlreadyExistsException() {
        super(DEFAULT_MESSAGE);
    }

    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
