package com.accounting.accounting.transaction.dto.transfer;

import com.accounting.accounting.transaction.dto.common.TransactionBaseRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class TransactionsCreateTransferRequest extends TransactionBaseRequest {
    @NotNull(message = "fromAccId is required")
    private Long fromAccId;

    @NotNull(message = "toAccId is required")
    private Long toAccId;
}
