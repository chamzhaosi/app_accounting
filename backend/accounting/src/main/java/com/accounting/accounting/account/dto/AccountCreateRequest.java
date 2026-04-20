package com.accounting.accounting.account.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@RequiredArgsConstructor
public class AccountCreateRequest {
  @NotBlank(message = "label is required")
  @Size(max= 50, message = "label must not exceed 50 characters")
  private String label;

  @Nullable
  @Size(max= 100, message = "description must not exceed 100 characters")
  private String description;

  @NotNull(message = "acc_type_id is required")
  private Long accTypeId;

  @NotNull(message = "isMainAccount is required")
  private Boolean isMainAccount;

  @Nullable
  @Digits(integer = 8, fraction = 2, message = "Amount must be up to 8 digits with up to 2 decimal places")
  private BigDecimal amount;
}
