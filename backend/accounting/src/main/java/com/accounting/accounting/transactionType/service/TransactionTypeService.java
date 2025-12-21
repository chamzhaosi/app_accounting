package com.accounting.accounting.transactionType.service;

import com.accounting.accounting.common.exception.ResourceNotFoundException;
import com.accounting.accounting.transactionType.dto.TransactionTypeRequest;
import com.accounting.accounting.transactionType.entity.TransactionType;
import com.accounting.accounting.transactionType.repository.TransactionTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionTypeService {
    private final TransactionTypeRepository repository;

    public TransactionTypeService(TransactionTypeRepository repository){
        this.repository = repository;
    }

    public TransactionType create(TransactionTypeRequest req){
        TransactionType transactionType = new TransactionType();
        transactionType.setTypeCode((req.getType_code()));
        transactionType.setDisplayName(req.getDisplay_name());

        return repository.save(transactionType);
    }

    public List<TransactionType> findAll() {
        return repository.findAll();
    }

    public List<TransactionType> findByActiveTrue (){
        return repository.findByActiveTrue();
    }

    public List<TransactionType> findByTypeCode (String typeCode){
        return repository.findByTypeCode(typeCode).orElseThrow(() -> notFoundTxnTypeByTypeCode(typeCode));
    }


    private ResourceNotFoundException notFoundTxnTypeByTypeCode(String typeCode){
        return  new ResourceNotFoundException("Transaction type not found with type code: " + typeCode);
    }

}


