package com.accounting.accounting.transaction.dto.common;

import com.accounting.accounting.common.dto.BaseResponseDto;
import com.accounting.accounting.transaction.entity.Transaction;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class TransactionBaseResponse extends BaseResponseDto {
  private String description;
  private BigDecimal amount;
  private LocalDate txnDate;

  public TransactionBaseResponse(Transaction transaction){
    super(transaction.getId(), transaction.getVrs());
    this.description = transaction.getDescription();
    this.amount = transaction.getAmount();
    this.txnDate = transaction.getTxnDate();
  }
}
