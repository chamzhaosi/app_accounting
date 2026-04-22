package com.accounting.accounting.transaction.dto.transfer;

import com.accounting.accounting.transaction.entity.Transaction;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionsTransferResponse {
  private TransactionTransferResponse fromTransaction;
  private TransactionTransferResponse toTransaction;

  public TransactionsTransferResponse(Transaction formTransaction, Transaction toTransaction){
    this.fromTransaction = new TransactionTransferResponse(formTransaction);
    this.toTransaction = new TransactionTransferResponse(toTransaction);
  }
}
