package com.accounting.accounting.budget.dto;

import com.accounting.accounting.budget.dto.common.BudgetCategoryResponse;
import com.accounting.accounting.budget.entity.Budget;
import com.accounting.accounting.common.dto.BaseResponseDto;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@NoArgsConstructor
public class BudgetResponse extends BaseResponseDto {
  private List<BudgetCategoryResponse> budgetCategoryResponseList;
  private BigDecimal totalBudget;
  private Boolean isActive;
  private BigDecimal unallocatedBudget;
  private BigDecimal overallocatedBudget;

  public BudgetResponse(Budget budget, List<BudgetCategoryResponse> budgetCategoryResponseList){
    super(budget.getId(), budget.getVrs());
    this.budgetCategoryResponseList = budgetCategoryResponseList;
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
