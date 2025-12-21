package com.accounting.accounting.transaction.service;

import com.accounting.accounting.transaction.dto.TransactionRequest;
import com.accounting.accounting.common.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import com.accounting.accounting.transaction.entity.Transaction;
import com.accounting.accounting.transaction.repository.TransactionRepository;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public Transaction create(TransactionRequest req) {
        Transaction tx = new Transaction();
        tx.setDescription(req.getDescription());
        tx.setAmount(req.getAmount());

        return repository.save(tx);
    }

    public List<Transaction> findAll(){
        return repository.findByDeletedFalse();
    }

    public Transaction findById(Long id){
        return repository.findByIdAndDeletedFalse(id).orElseThrow(() -> notFoundTxnById(id));
    }


    @Transactional
    public Transaction update(Long id, TransactionRequest req){
        Transaction tx = repository.findByIdAndDeletedFalse(id).orElseThrow(() -> notFoundTxnById(id));

        tx.setAmount(req.getAmount());
        tx.setDescription(req.getDescription());

        return tx;
    }

    @Transactional
    public void delete(Long id){
        Transaction tx = repository.findByIdAndDeletedFalse(id).orElseThrow(() -> notFoundTxnById(id));

        tx.setDeleted();
    }

    private ResourceNotFoundException notFoundTxnById(Long id){
        return  new ResourceNotFoundException("Transaction not found with id: " + id);
    }
}

