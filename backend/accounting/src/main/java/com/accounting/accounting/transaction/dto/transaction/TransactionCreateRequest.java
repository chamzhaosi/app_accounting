package com.accounting.accounting.transaction.dto.transaction;

import com.accounting.accounting.transaction.dto.common.TransactionBasedRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class TransactionCreateRequest extends TransactionBasedRequest {
  @NotNull(message = "ctgrId is required")
  private Long ctgrId;

  @NotNull(message = "accId is required")
  private Long accId;
}
