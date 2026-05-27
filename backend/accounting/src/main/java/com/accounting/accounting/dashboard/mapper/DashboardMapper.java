package com.accounting.accounting.dashboard.mapper;

import com.accounting.accounting.dashboard.dto.DashboardTransactionSummaryResponse;
import com.accounting.accounting.transaction.dto.common.TransactionSummary;
import com.accounting.accounting.transaction.dto.transaction.TransactionResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DashboardMapper {
  public DashboardTransactionSummaryResponse toResponse(List<TransactionResponse> top5ExpenseTransactionList, TransactionSummary transactionSummary){
    return new DashboardTransactionSummaryResponse( top5ExpenseTransactionList,
            transactionSummary.getTotalExpense(), transactionSummary.getTotalIncome());
  }
}
