package com.accounting.accounting.transaction.mapper;


import com.accounting.accounting.transaction.dto.adjustment.TransactionAdjustResponse;
import com.accounting.accounting.transaction.dto.transaction.TransactionResponse;
import com.accounting.accounting.transaction.dto.transfer.TransactionTransferResponse;
import com.accounting.accounting.transaction.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {
  public TransactionResponse toResponse(Transaction transaction){
    return new TransactionResponse(transaction);
  }

  public TransactionTransferResponse toAdjustResponse(Transaction formTransaction, Transaction toTransaction){
    return new TransactionTransferResponse(formTransaction, toTransaction);
  }

  public TransactionAdjustResponse toAdjustResponse(Transaction transaction){
    return new TransactionAdjustResponse(transaction);
  }
}
