package com.accounting.accounting.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class AccountUpdateRequest extends AccountCreateRequest{
  @NotNull(message = "id is required")
  private Long id;

  @NotNull(message = "isActive is required")
  private boolean isActive;
}
