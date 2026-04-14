package com.accounting.accounting.common.exception;

import com.accounting.accounting.common.enums.ExceptionEnum;
import lombok.Getter;

@Getter
public class AuthenticationFailedException extends RuntimeException {
  private static final String DEFAULT_MESSAGE = ExceptionEnum.INVALID_LOGIN_CREDENTIAL.getMessage();
  private static final String DEFAULT_ERROR_CODE = ExceptionEnum.INVALID_LOGIN_CREDENTIAL.name();
  private final String errorCode;

  public AuthenticationFailedException() {
    super(DEFAULT_MESSAGE);
    this.errorCode = DEFAULT_ERROR_CODE;
  }

  public AuthenticationFailedException(ExceptionEnum exceptionEnum) {
    super(exceptionEnum.getMessage());
    this.errorCode = exceptionEnum.name();
  }
}
