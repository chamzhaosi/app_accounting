package com.accounting.accounting.budget.dto.common;

import com.accounting.accounting.budget.entity.BudgetCategory;
import com.accounting.accounting.category.dto.CategoryResponse;
import com.accounting.accounting.common.dto.BaseDto;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class BudgetCategoryResponse implements BaseDto {
  private Long id;
  private Long vrs;
  private CategoryResponse category;
  private BigDecimal amount;

  public BudgetCategoryResponse(BudgetCategory budgetCategory){
    this.id = budgetCategory.getId();
    this.vrs = budgetCategory.getVrs();
    this.category = new CategoryResponse(budgetCategory.getCategory());
    this.amount = budgetCategory.getAmount();
  }
}
