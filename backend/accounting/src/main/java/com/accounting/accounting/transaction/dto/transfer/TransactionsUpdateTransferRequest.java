package com.accounting.accounting.transaction.dto.transfer;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransactionsUpdateTransferRequest {
  @NotNull(message = "fromTransaction is required")
  @Valid
  private TransactionTransferRequest fromTransaction;

  @NotNull(message = "toTransaction is required")
  @Valid
  private TransactionTransferRequest toTransaction;
}
