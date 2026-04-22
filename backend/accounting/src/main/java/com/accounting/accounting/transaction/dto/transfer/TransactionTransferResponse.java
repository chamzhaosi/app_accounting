package com.accounting.accounting.transaction.dto.transfer;

import com.accounting.accounting.account.dto.AccountResponse;
import com.accounting.accounting.transaction.dto.common.TransactionBaseResponse;
import com.accounting.accounting.transaction.entity.Transaction;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransactionTransferResponse extends TransactionBaseResponse {
  private AccountResponse account;

  public TransactionTransferResponse(Transaction transaction){
    super(transaction);
    this.account = new AccountResponse(transaction.getAccount());
  }
}
