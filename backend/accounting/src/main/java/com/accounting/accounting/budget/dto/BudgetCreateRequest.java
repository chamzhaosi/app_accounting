package com.accounting.accounting.budget.dto;

import com.accounting.accounting.budget.dto.common.BudgetCategoryRequest;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class BudgetCreateRequest {
  @NotEmpty(message = "budgetCategoriesList is required")
  private List<@NotNull(message = "item of budgetCategoriesList cannot be null") BudgetCategoryRequest> budgetCategoriesList;
}
