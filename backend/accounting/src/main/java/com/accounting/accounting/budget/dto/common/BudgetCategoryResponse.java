package com.accounting.accounting.budget.dto.common;

import com.accounting.accounting.budget.entity.BudgetCategory;
import com.accounting.accounting.category.dto.CategoryResponse;
import com.accounting.accounting.common.dto.BaseResponseDto;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class BudgetCategoryResponse extends BaseResponseDto {
  private CategoryResponse category;
  private BigDecimal amount;

  public BudgetCategoryResponse(BudgetCategory budgetCategories){
    super(budgetCategories.getId(), budgetCategories.getVrs());
    this.category = new CategoryResponse(budgetCategories.getCategory());
    this.amount = budgetCategories.getAmount();
  }
}
