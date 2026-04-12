package com.accounting.accounting.common.enums;

import lombok.Getter;

@Getter
public enum UserPwsStatusEnum {
  ACTIVE("A"), INACTIVE("I"), EXPIRED("EXP");

  private final String code;

  UserPwsStatusEnum(String code){
    this.code = code;
  }
}
