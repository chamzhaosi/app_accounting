package com.accounting.accounting.transaction.repository;

import com.accounting.accounting.transaction.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByDeletedFalse();

    Optional<Transaction> findByIdAndDeletedFalse(Long id);
}
