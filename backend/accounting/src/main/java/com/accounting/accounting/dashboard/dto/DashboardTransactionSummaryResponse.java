package com.accounting.accounting.dashboard.dto;

import com.accounting.accounting.transaction.dto.transaction.TransactionResponse;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor
public class DashboardTransactionSummaryResponse {
  @NonNull
  List<TransactionResponse> top5ExpensesTransactionList;

  @NonNull
  BigDecimal totalExpense;

  @NonNull
  BigDecimal totalIncome;
}
