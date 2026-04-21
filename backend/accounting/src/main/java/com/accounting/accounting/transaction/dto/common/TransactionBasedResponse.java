package com.accounting.accounting.transaction.dto.common;

import com.accounting.accounting.transaction.entity.Transaction;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class TransactionBasedResponse {
  private String description;
  private BigDecimal amount;
  private LocalDate txnDate;

  public TransactionBasedResponse(Transaction transaction){
    this.description = transaction.getDescription();
    this.amount = transaction.getAmount();
    this.txnDate = transaction.getTxnDate();
  }
}
