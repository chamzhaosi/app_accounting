package com.accounting.accounting.budget.dto.common;

import com.accounting.accounting.common.dto.BaseUpdateRequestDto;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class BudgetCategoryUpdateRequest extends BaseUpdateRequestDto {
  @NotNull(message = "ctgrId is required")
  private Long ctgrId;

  @NotNull(message = "amount is required")
  @Digits(integer = 8, fraction = 2, message = "Amount must be up to 8 digits with up to 2 decimal places")
  private BigDecimal amount;
}
