package com.accounting.accounting.transaction.dto.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionSummary {
  private BigDecimal totalIncome;
  private BigDecimal totalExpense;
}
