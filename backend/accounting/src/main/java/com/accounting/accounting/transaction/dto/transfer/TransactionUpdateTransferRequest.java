package com.accounting.accounting.transaction.dto.transfer;

import com.accounting.accounting.transaction.dto.common.TransactionBasedRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransactionUpdateTransferRequest extends TransactionBasedRequest {
  @NotNull(message = "fromId is required")
  private Long fromId;

  @NotNull(message = "toId is required")
  private Long toId;

  @NotNull(message = "fromAccId is required")
  private Long fromAccId;

  @NotNull(message = "toAccId is required")
  private Long toAccId;
}
