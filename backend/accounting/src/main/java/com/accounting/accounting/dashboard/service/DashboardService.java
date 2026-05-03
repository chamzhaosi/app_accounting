package com.accounting.accounting.dashboard.service;

import com.accounting.accounting.category.service.CategoryService;
import com.accounting.accounting.dashboard.dto.DashboardBudgetSummaryResponse;
import com.accounting.accounting.dashboard.dto.DashboardCategoriesSummaryResponse;
import com.accounting.accounting.dashboard.dto.DashboardSearchTransactionsRequest;
import com.accounting.accounting.dashboard.dto.DashboardTransactionSummaryResponse;
import com.accounting.accounting.dashboard.mapper.DashboardMapper;
import com.accounting.accounting.transaction.dto.common.TransactionCategoriesSummary;
import com.accounting.accounting.transaction.dto.common.TransactionSummary;
import com.accounting.accounting.transaction.dto.transaction.TransactionResponse;
import com.accounting.accounting.transaction.dto.transaction.TransactionSearchRequest;
import com.accounting.accounting.transaction.service.TransactionService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DashboardService {
  private final TransactionService transactionService;
  private final DashboardMapper dashboardMapper;

  public DashboardTransactionSummaryResponse findTransactionSummaryByPeriod(DashboardSearchTransactionsRequest request){
    List<TransactionResponse> top5ExpenseTransactionList = transactionService.getTop5TransactionList(request.getSttTxnDate(), request.getEndTxnDate());
    TransactionSummary transactionSummary = transactionService.getSummaryByPeriod(request.getSttTxnDate(), request.getEndTxnDate());
    return dashboardMapper.toResponse(top5ExpenseTransactionList, transactionSummary);
  };

  public Page<@NonNull TransactionResponse> findTransactionsByPeriod(DashboardSearchTransactionsRequest request, Pageable pageable){
    TransactionSearchRequest transactionSearchRequest = new TransactionSearchRequest();
    transactionSearchRequest.setSttTxnDate(request.getSttTxnDate());
    transactionSearchRequest.setEndTxnDate(request.getEndTxnDate());
    return transactionService.findAll(transactionSearchRequest, pageable);
  }

  public DashboardCategoriesSummaryResponse findCategoriesByPeriod(DashboardSearchTransactionsRequest request){
    return transactionService.getCategoriesSummary(request.getSttTxnDate(), request.getEndTxnDate());
  }

  public Optional<DashboardBudgetSummaryResponse> findBudgetByPeriod(DashboardSearchTransactionsRequest request){
    return transactionService.getBudgetSummary(request.getSttTxnDate());
  }
}
