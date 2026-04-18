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
public class TransactionResponse {
  private Long id;
  private String description;
  private BigDecimal amount;
  private AccountResponse account;
  private LocalDate txnDate;
  private CategoryResponse category;

  public TransactionResponse (Transaction transaction){
    this.id = transaction.getId();
    this.description = transaction.getDescription();
    this.amount = transaction.getAmount();
    this.account = new AccountResponse(transaction.getAccount());
    this.txnDate = transaction.getTxnDate();
    this.category = new CategoryResponse(transaction.getCategory());
  }
}
