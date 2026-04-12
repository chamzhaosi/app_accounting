package com.accounting.accounting.transaction.repository;

import com.accounting.accounting.transaction.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionTypeRepository extends JpaRepository<TransactionType, Long> {

    List<TransactionType> findByIsActiveTrue();

}
