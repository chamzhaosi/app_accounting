package com.accounting.accounting.transaction.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionUpdateRequest extends TransactionCreateRequest{
  @NotNull(message = "id is required")
  private Long id;
}
