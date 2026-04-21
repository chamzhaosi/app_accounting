package com.accounting.accounting.transaction.dto.adjustment;

import com.accounting.accounting.account.dto.AccountResponse;
import com.accounting.accounting.transaction.dto.common.TransactionBasedResponse;
import com.accounting.accounting.transaction.entity.Transaction;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransactionAdjustResponse extends TransactionBasedResponse {
  private Long id;
  private AccountResponse account;

  public TransactionAdjustResponse(Transaction transaction){
    super(transaction);
    this.id = transaction.getId();
    this.account = new AccountResponse(transaction.getAccount());
  }

}
