package com.accounting.accounting.transaction.dto.txntype;

import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransactionTypeResponse {
    private Long id;
    private String label;

    @JsonProperty("isActive")
    private boolean isActive;

    @JsonProperty("isCreatedBySystem")
    private boolean isCreatedBySystem;

    public TransactionTypeResponse(TransactionType transactionType){
        this.id = transactionType.getId();
        this.label = transactionType.getLabel();
        this.isActive = transactionType.getIsActive();
        this.isCreatedBySystem = transactionType.getUser() == null;
    }
}
