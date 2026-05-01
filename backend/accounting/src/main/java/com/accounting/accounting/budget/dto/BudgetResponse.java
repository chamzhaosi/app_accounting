package com.accounting.accounting.budget.dto;

import com.accounting.accounting.budget.dto.common.BudgetCategoryResponse;
import com.accounting.accounting.budget.entity.Budget;
import com.accounting.accounting.common.dto.BaseDto;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@NoArgsConstructor
public class BudgetResponse implements BaseDto {
  private Long id;
  private Long vrs;
  private List<BudgetCategoryResponse> budgetCategoriesList;
  private BigDecimal totalBudget;
  private Boolean isActive;
  private BigDecimal unallocatedBudget;
  private BigDecimal overallocatedBudget;

  public BudgetResponse(Budget budget, List<BudgetCategoryResponse> budgetCategoryResponseList){
    this.id = budget.getId();
    this.vrs = budget.getVrs();
    this.budgetCategoriesList = budgetCategoryResponseList;
    this.totalBudget = budget.getTotalBudget();
    this.isActive = budget.getIsActive();

    BigDecimal allocatedBudget = budgetCategoryResponseList.stream().map(BudgetCategoryResponse::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal difference = totalBudget.subtract(allocatedBudget);

    if (difference.compareTo(BigDecimal.ZERO) > 0) {
      this.unallocatedBudget = difference;
      this.overallocatedBudget = BigDecimal.ZERO;
    } else if (difference.compareTo(BigDecimal.ZERO) < 0) {
      this.unallocatedBudget = BigDecimal.ZERO;
      this.overallocatedBudget = difference.abs();
    } else {
      this.unallocatedBudget = BigDecimal.ZERO;
      this.overallocatedBudget = BigDecimal.ZERO;
    }
  }
}
