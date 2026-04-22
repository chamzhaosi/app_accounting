package com.accounting.accounting.transaction.dto.common;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@RequiredArgsConstructor
public class TransactionBaseRequest {
  @NotNull(message = "txnTypeId is required")
  private Long txnTypeId;

  @Nullable
  @Size(max = 100, message = "description must not exceed 100 characters")
  private String description;

  @NotNull(message = "amount is required")
  @Digits(integer = 8, fraction = 2, message = "Amount must be up to 8 digits with up to 2 decimal places")
  private BigDecimal amount;

  @NotNull(message = "txnDate is required")
  private LocalDate txnDate;
}
