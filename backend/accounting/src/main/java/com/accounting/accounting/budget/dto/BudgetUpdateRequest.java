package com.accounting.accounting.budget.dto;

import com.accounting.accounting.budget.dto.common.BudgetCategoryCreateRequest;
import com.accounting.accounting.budget.dto.common.BudgetCategoryUpdateRequest;
import com.accounting.accounting.common.dto.BaseDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
public class BudgetUpdateRequest implements BaseDto {
  private Long id;
  private Long vrs;

  private List<@NotNull(message = "item of existBudgetCategoriesList is required")
  @Valid BudgetCategoryUpdateRequest> existBudgetCategoriesList;

  private List<@NotNull(message = "item of newBudgetCategoriesList is required")
  @Valid BudgetCategoryCreateRequest> newBudgetCategoriesList;

  @Digits(integer = 8, fraction = 2, message = "totalBudget must be up to 8 digits with up to 2 decimal places")
  @NotNull(message = "totalBudget is required")
  private BigDecimal totalBudget;

  @NotNull(message = "isActive is required")
  private Boolean isActive;
}
