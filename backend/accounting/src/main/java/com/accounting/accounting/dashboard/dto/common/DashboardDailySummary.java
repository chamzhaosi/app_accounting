package com.accounting.accounting.dashboard.dto.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class DashboardDailySummary {
  private LocalDate txnDate;
  private BigDecimal incomeAmt;
  private BigDecimal expenseAmt;
}
