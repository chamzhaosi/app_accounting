package com.accounting.accounting.transaction.dto.common;

import com.accounting.accounting.category.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class TransactionBudgetSummary {
  private Category category;
  private BigDecimal totalExpense;
  private BigDecimal totalBudget;
}
