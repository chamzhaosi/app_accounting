package com.accounting.accounting.transaction.dto.txntype;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class TransactionTypeSearchRequest {
    @NotNull(message = "isActive is required")
    private Boolean isActive;
}
