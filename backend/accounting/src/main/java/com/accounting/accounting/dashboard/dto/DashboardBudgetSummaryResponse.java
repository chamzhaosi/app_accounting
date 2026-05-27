package com.accounting.accounting.dashboard.dto;


import com.accounting.accounting.budget.dto.BudgetResponse;
import com.accounting.accounting.transaction.dto.common.TransactionBudgetSummary;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class DashboardBudgetSummaryResponse {
  List<TransactionBudgetSummary> transactionBudgetSummaryList;
  private BigDecimal totalBudget; // monthly total budget
  private BigDecimal totalBalance; // total up all categories expense and minus total budget
  private BigDecimal allocatedBudget;
  private BigDecimal unallocatedBudget;
  private BigDecimal overallocatedBudget;

  public DashboardBudgetSummaryResponse(List<TransactionBudgetSummary> transactionBudgetSummaryList, BudgetResponse budgetResponse){
    BigDecimal totalAllocatedBudget = BigDecimal.ZERO;
    BigDecimal totalExpense = BigDecimal.ZERO;

    for (TransactionBudgetSummary item : transactionBudgetSummaryList) {
      totalAllocatedBudget = totalAllocatedBudget.add(item.getTotalBudget());
      totalExpense = totalExpense.add(item.getTotalExpense());
    }

    this.transactionBudgetSummaryList= transactionBudgetSummaryList;
    this.totalBudget= budgetResponse.getTotalBudget();
    this.totalBalance = budgetResponse.getTotalBudget().subtract(totalExpense);
    this.allocatedBudget = totalAllocatedBudget;
    this.unallocatedBudget = budgetResponse.getUnallocatedBudget();
    this.overallocatedBudget = budgetResponse.getOverallocatedBudget();
  }
}
