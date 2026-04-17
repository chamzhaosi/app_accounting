package com.accounting.accounting.transaction.mapper;

import com.accounting.accounting.transaction.dto.txntype.TransactionTypeResponse;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TransactionTypeMapper {
    public List<TransactionTypeResponse> toResponseList(List<TransactionType> entities) {
        return entities.stream()
                .map(TransactionTypeResponse::new)
                .toList();
    }

    public TransactionTypeResponse toResponse(TransactionType entities) {
        return new TransactionTypeResponse(entities);
    }
}
