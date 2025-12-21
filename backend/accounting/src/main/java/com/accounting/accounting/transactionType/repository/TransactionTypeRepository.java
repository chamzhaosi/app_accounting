package com.accounting.accounting.transactionType.repository;

import com.accounting.accounting.transactionType.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionTypeRepository extends JpaRepository<TransactionType, Long> {

    List<TransactionType> findByActiveTrue();

    Optional<List<TransactionType>> findByTypeCode(String typeCode);

}
