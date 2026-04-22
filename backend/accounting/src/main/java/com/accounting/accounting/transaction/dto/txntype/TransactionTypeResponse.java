package com.accounting.accounting.transaction.dto.txntype;

import com.accounting.accounting.common.dto.BaseResponseDto;
import com.accounting.accounting.common.enums.TransactionNatureEnum;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;

@Getter
@Setter
@NoArgsConstructor
public class TransactionTypeResponse extends BaseResponseDto {
    private String label;
    private String nature;

    @JsonProperty("isActive")
    private boolean isActive;

    @JsonProperty("isCreatedBySystem")
    private boolean isCreatedBySystem;

    public TransactionTypeResponse(TransactionType transactionType){
        super(transactionType.getId(), transactionType.getVrs());
        this.label = transactionType.getLabel();
        this.isActive = transactionType.getIsActive();
        this.isCreatedBySystem = transactionType.getUser() == null;
        this.nature = Arrays.stream(TransactionNatureEnum.values())
                .filter(n -> Objects.equals(n.getCode(), transactionType.getNature()))
                .map(Enum::name)
                .findFirst()
                .orElse(null);
    }
}
