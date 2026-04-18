package com.accounting.accounting.transaction.dto;

import jakarta.annotation.Nullable;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Nullable
@Getter
@Setter
@RequiredArgsConstructor
public class TransactionSearchRequest {
  private Long txnTypeId;
  private Long ctgrId;
  private Long accId;
  private String description;

  @DateTimeFormat(pattern = "yyyy-MM-dd")
  private LocalDate txnDate;

  @DateTimeFormat(pattern = "yyyy-MM-dd")
  private LocalDate sttTxnDate;

  @DateTimeFormat(pattern = "yyyy-MM-dd")
  private LocalDate endTxnDate;
}
