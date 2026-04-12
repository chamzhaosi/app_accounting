package com.accounting.accounting.common.enums;

import lombok.Getter;

@Getter
public enum UserStatusEnum {
  ACTIVE("A"), INACTIVE("I") ;

  private final String code;

  UserStatusEnum(String code){
    this.code = code;
  }
}
