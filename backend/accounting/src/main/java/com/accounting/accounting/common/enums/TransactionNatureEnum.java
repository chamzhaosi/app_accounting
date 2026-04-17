package com.accounting.accounting.common.enums;

import lombok.Getter;

@Getter
public enum TransactionNatureEnum {
    IN(1L), OUT(2L);

    private final Long code;

    TransactionNatureEnum(Long code){
        this.code = code;
    }
}
