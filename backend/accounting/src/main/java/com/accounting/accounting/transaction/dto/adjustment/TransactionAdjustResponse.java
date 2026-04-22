package com.accounting.accounting.transaction.dto.adjustment;

import com.accounting.accounting.account.dto.AccountResponse;
import com.accounting.accounting.transaction.dto.common.TransactionBaseResponse;
import com.accounting.accounting.transaction.entity.Transaction;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionAdjustResponse extends TransactionBaseResponse {
  private AccountResponse account;

  public TransactionAdjustResponse(Transaction transaction){
    super(transaction);
    this.account = new AccountResponse(transaction.getAccount());
  }

}
