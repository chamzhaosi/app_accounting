package com.accounting.accounting.dashboard.controller;

import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.common.response.ApiResponsePagination;
import com.accounting.accounting.dashboard.dto.*;
import com.accounting.accounting.dashboard.dto.common.DashboardDailySummary;
import com.accounting.accounting.dashboard.service.DashboardService;
import com.accounting.accounting.transaction.dto.transaction.TransactionResponse;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
  private final DashboardService dashboardService;

  @GetMapping("/get-transactions-summary")
  public ApiResponse<DashboardTransactionSummaryResponse> findPageByPeriod(@Valid DashboardSearchTransactionsRequest request){
    DashboardTransactionSummaryResponse dashboardTransactionResponse = dashboardService.findTransactionSummaryByPeriod(request);
    return ApiResponse.success(dashboardTransactionResponse);
  }

  @GetMapping("/get-transactions")
  public ApiResponsePagination<TransactionResponse> findTransactionsByPeriod(@Valid DashboardSearchTransactionsRequest request, Pageable pageable){
    Page<@NonNull TransactionResponse> transactionResponseList = dashboardService.findTransactionsByPeriod(request, pageable);
    return ApiResponsePagination.success(transactionResponseList);
  }

  @GetMapping("/get-categories-summary")
  public ApiResponse<DashboardCategoriesSummaryResponse> findCategoriesByPeriod(@Valid DashboardSearchTransactionsRequest request){
    DashboardCategoriesSummaryResponse dashboardCategoriesSummaryResponse = dashboardService.findCategoriesByPeriod(request);
    return ApiResponse.success(dashboardCategoriesSummaryResponse);
  }

  @GetMapping("/get-budget-summary")
  public ApiResponse<DashboardBudgetSummaryResponse> findBudgetByPeriod(@Valid DashboardSearchTransactionsRequest request){
    Optional<DashboardBudgetSummaryResponse> dashboardCategoriesSummaryResponse = dashboardService.findBudgetByPeriod(request);
    return ApiResponse.success(dashboardCategoriesSummaryResponse.orElse(null));
  }

  @GetMapping("/get-cash-flow-balance")
  public ApiResponse<BigDecimal> findCashFlowBalance(){
    return ApiResponse.success((dashboardService.findCashFlowBalance()));
  }

  @GetMapping("/get-calendar-summary/{date}")
  public List<DashboardDailySummary> findCalendarSummary(@PathVariable LocalDate date) {
    return dashboardService.findCalendarSummaryResponse(date);
  }
}
