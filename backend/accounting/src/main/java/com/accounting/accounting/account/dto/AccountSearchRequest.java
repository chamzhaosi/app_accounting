package com.accounting.accounting.account.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class AccountSearchRequest {
  @Nullable
  private String label;

  @NotNull(message = "acc_type_id is required")
  private Long accTypeId;

  @NotNull(message = "isActive is required")
  private Boolean isActive;
}
