package com.accounting.accounting.transaction.dto.transaction;

import com.accounting.accounting.transaction.dto.common.TransactionBasedRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionUpdateRequest extends TransactionBasedRequest {
  @NotNull(message = "id is required")
  private Long id;

  @NotNull(message = "ctgrId is required")
  private Long ctgrId;

  @NotNull(message = "accId is required")
  private Long accId;
}
