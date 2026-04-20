package com.accounting.accounting.transaction.dto;

import com.accounting.accounting.account.dto.AccountResponse;
import com.accounting.accounting.category.dto.CategoryResponse;
import com.accounting.accounting.transaction.entity.Transaction;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class TransactionTransferResponse {
  private Long fromId;
  private Long toId;
  private String description;
  private BigDecimal amount;
  private AccountResponse fromAccount;
  private AccountResponse toAccount;
  private LocalDate txnDate;
  private CategoryResponse category;

  public TransactionTransferResponse (Transaction formTransaction, Transaction toTransaction){
    this.fromId = formTransaction.getId();
    this.toId = toTransaction.getId();
    this.description = formTransaction.getDescription();
    this.amount = formTransaction.getAmount();
    this.fromAccount = new AccountResponse(formTransaction.getAccount());
    this.toAccount = new AccountResponse(toTransaction.getAccount());
    this.txnDate = formTransaction.getTxnDate();
  }
}
