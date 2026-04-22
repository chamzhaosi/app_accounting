package com.accounting.accounting.transaction.dto.adjustment;

import com.accounting.accounting.transaction.dto.common.TransactionBaseUpdateRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class TransactionUpdateAdjustRequest extends TransactionBaseUpdateRequest {
  @NotNull(message = "accId is required")
  private Long accId;
}
