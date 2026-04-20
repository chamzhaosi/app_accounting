package com.accounting.accounting.common.enums;

import lombok.Getter;

@Getter
public enum TransactionNatureEnum {
    INC("INC"), EXP("EXP"), ADJ("ADJ"), TSF("TSF");

    private final String code;

    TransactionNatureEnum(String code){
        this.code = code;
    }
}
