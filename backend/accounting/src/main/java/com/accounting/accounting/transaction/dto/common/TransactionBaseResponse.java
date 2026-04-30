package com.accounting.accounting.transaction.dto.common;

import com.accounting.accounting.common.dto.BaseDto;
import com.accounting.accounting.transaction.entity.Transaction;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class TransactionBaseResponse implements BaseDto {
  private Long id;
  private Long vrs;
  private String description;
  private BigDecimal amount;
  private LocalDate txnDate;

  public TransactionBaseResponse(Transaction transaction){
    this.id = transaction.getId();
    this.vrs = transaction.getVrs();
    this.description = transaction.getDescription();
    this.amount = transaction.getAmount();
    this.txnDate = transaction.getTxnDate();
  }
}
