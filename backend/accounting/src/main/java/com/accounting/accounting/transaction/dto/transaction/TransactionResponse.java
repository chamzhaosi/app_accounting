package com.accounting.accounting.transaction.dto.transaction;

import com.accounting.accounting.account.dto.AccountResponse;
import com.accounting.accounting.category.dto.CategoryResponse;
import com.accounting.accounting.transaction.dto.common.TransactionBasedResponse;
import com.accounting.accounting.transaction.entity.Transaction;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransactionResponse extends TransactionBasedResponse {
  private Long id;
  private AccountResponse account;
  private CategoryResponse category;

  public TransactionResponse (Transaction transaction){
    super(transaction);
    this.id = transaction.getId();
    this.account = new AccountResponse(transaction.getAccount());
    this.category = transaction.getCategory() != null?
                    new CategoryResponse(transaction.getCategory()):
                    null;
  }
}
