package com.accounting.accounting.transaction.mapper;

import com.accounting.accounting.transaction.dto.txntype.TransactionTypeResponse;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import org.springframework.stereotype.Component;

@Component
public class TransactionTypeMapper {
    public TransactionTypeResponse toResponse(TransactionType entity) {
        return new TransactionTypeResponse(entity);
    }
}
