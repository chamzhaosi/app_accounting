package com.accounting.accounting.dashboard.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
@RequiredArgsConstructor
public class DashboardSearchTransactionsRequest {
  @DateTimeFormat(pattern = "yyyy-MM-dd")
  private LocalDate sttTxnDate;

  @DateTimeFormat(pattern = "yyyy-MM-dd")
  private LocalDate endTxnDate;
}
