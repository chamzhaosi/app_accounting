package com.accounting.accounting.transaction.mapper;


import com.accounting.accounting.transaction.dto.TransactionResponse;
import com.accounting.accounting.transaction.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {
  public TransactionResponse toResponse(Transaction transaction){
    return new TransactionResponse(transaction);
  }
}
