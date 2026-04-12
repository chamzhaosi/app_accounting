package com.accounting.accounting.common.enums;

import lombok.Getter;

@Getter
public enum UserRefreshTokenStatusEnum {
  USED("U"), ACTIVE("A"), INACTIVE("I"), EXPIRED("EXP");

  private final String code;

  UserRefreshTokenStatusEnum(String code){
    this.code = code;
  }
}
