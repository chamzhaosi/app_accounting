package com.accounting.accounting.budget.mapper;

import com.accounting.accounting.budget.dto.BudgetResponse;
import com.accounting.accounting.budget.dto.common.BudgetCategoryResponse;
import com.accounting.accounting.budget.entity.Budget;
import com.accounting.accounting.budget.entity.BudgetCategory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BudgetMapper {
  public BudgetResponse toResponse(Budget budget, List<BudgetCategory> budgetCategories){
    return new BudgetResponse(budget, budgetCategories.stream().map(BudgetCategoryResponse::new).toList());
  }
}
