package com.accounting.accounting.common.enums;

import lombok.Getter;

@Getter
public enum UserForgetPwsStatusEnum {
  ACTIVE("A"), INACTIVE("I"), EXPIRED("EXP");

  private final String code;

  UserForgetPwsStatusEnum(String code){
    this.code = code;
  }
}
