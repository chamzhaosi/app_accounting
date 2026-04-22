package com.accounting.accounting.transaction.dto.transfer;

import com.accounting.accounting.transaction.dto.common.TransactionBaseUpdateRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionTransferRequest extends TransactionBaseUpdateRequest {
  @NotNull
  private Long accId;
}
