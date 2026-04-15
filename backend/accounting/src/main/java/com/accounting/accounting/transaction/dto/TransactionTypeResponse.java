package com.accounting.accounting.transaction.dto;

import com.accounting.accounting.transaction.entity.TransactionType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class TransactionTypeResponse {
    private Long id;
    private String label;
    private boolean isActive;
    private boolean isCreatedBySystem;

    public TransactionTypeResponse(TransactionType transactionType){
        this.id = transactionType.getId();
        this.label = transactionType.getLabel();
        this.isActive = transactionType.getIsActive();
        this.isCreatedBySystem = transactionType.getUser() == null;
    }
}
