package com.accounting.accounting.transaction.service;

import com.accounting.accounting.common.exception.ResourceNotFoundException;
import com.accounting.accounting.transaction.dto.TransactionTypeRequest;
import com.accounting.accounting.transaction.entity.TransactionType;
import com.accounting.accounting.transaction.repository.TransactionTypeRepository;
import com.accounting.accounting.user.entity.User;
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
//        transactionType.setUser();  // TODO
        transactionType.setLabel(req.getLabel());

        return repository.save(transactionType);
    }

    public List<TransactionType> findAll() {
        return repository.findAll();
    }

    public List<TransactionType> findByActiveTrue (){
        return repository.findByIsActiveTrue();
    }

    public TransactionType findById (Long typeId){
        return repository.findById(typeId).orElseThrow(() -> notFoundTxnTypeById(typeId));
    }


    private ResourceNotFoundException notFoundTxnTypeById(Long typeId){
        return  new ResourceNotFoundException("Transaction type not found with id: " + typeId);
    }

}


