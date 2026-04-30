package com.accounting.accounting.budget.dto;

import com.accounting.accounting.budget.dto.common.BudgetCategoryUpdateRequest;
import com.accounting.accounting.common.dto.BaseUpdateRequestDto;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
public class BudgetUpdateRequest extends BaseUpdateRequestDto {
  @NotEmpty(message = "budgetCategoryRequestList is required")
  private List<@NotNull(message = "item of budgetCategoryRequestList is required") BudgetCategoryUpdateRequest> budgetCategoriesList;

  @Digits(integer = 8, fraction = 2, message = "totalBudget must be up to 8 digits with up to 2 decimal places")
  @NotNull(message = "totalBudget is required")
  private BigDecimal totalBudget;

  @NotNull(message = "isActive is required")
  private Boolean isActive;
}
