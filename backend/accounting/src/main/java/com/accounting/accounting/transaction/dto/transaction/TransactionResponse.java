package com.accounting.accounting.transaction.dto.transaction;

import com.accounting.accounting.account.dto.AccountResponse;
import com.accounting.accounting.category.dto.CategoryResponse;
import com.accounting.accounting.transaction.dto.common.TransactionBaseResponse;
import com.accounting.accounting.transaction.entity.Transaction;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionResponse extends TransactionBaseResponse {
  private AccountResponse account;
  private CategoryResponse category;

  public TransactionResponse (Transaction transaction){
    super(transaction);
    this.account = new AccountResponse(transaction.getAccount());
    this.category = transaction.getCategory() != null
            ? new CategoryResponse(transaction.getCategory())
            : null;
  }
}
