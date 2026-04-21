package com.accounting.accounting.transaction.dto.transfer;

import com.accounting.accounting.account.dto.AccountResponse;
import com.accounting.accounting.transaction.dto.common.TransactionBasedResponse;
import com.accounting.accounting.transaction.entity.Transaction;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransactionTransferResponse extends TransactionBasedResponse {
  private Long fromId;
  private Long toId;
  private AccountResponse fromAccount;
  private AccountResponse toAccount;

  public TransactionTransferResponse (Transaction formTransaction, Transaction toTransaction){
    super(toTransaction);
    this.fromId = formTransaction.getId();
    this.toId = toTransaction.getId();
    this.fromAccount = new AccountResponse(formTransaction.getAccount());
    this.toAccount = new AccountResponse(toTransaction.getAccount());
  }
}
