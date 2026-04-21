package com.accounting.accounting.transaction.dto.adjustment;

import com.accounting.accounting.transaction.dto.common.TransactionBasedRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class TransactionUpdateAdjustRequest extends TransactionBasedRequest {
  @NotNull(message = "id is required")
  private Long id;

  @NotNull(message = "accId is required")
  private Long accId;
}
