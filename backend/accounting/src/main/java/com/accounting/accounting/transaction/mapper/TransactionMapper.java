package com.accounting.accounting.transaction.mapper;


import com.accounting.accounting.transaction.dto.TransactionResponse;
import com.accounting.accounting.transaction.dto.TransactionTransferResponse;
import com.accounting.accounting.transaction.entity.Transaction;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TransactionMapper {
  public TransactionResponse toResponse(Transaction transaction){
    return new TransactionResponse(transaction);
  }

  public TransactionTransferResponse toTransferResponse(Transaction formTransaction, Transaction toTransaction){
    return new TransactionTransferResponse(formTransaction, toTransaction);
  }
}
