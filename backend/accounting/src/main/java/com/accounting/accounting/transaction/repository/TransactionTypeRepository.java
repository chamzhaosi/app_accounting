package com.accounting.accounting.transaction.repository;

import com.accounting.accounting.transaction.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TransactionTypeRepository extends JpaRepository<TransactionType, Long> {

    @Query("""
    SELECT t
    FROM TransactionType t
    WHERE (t.user.id = :userId OR t.user IS NULL)
      AND t.isActive = true
    """)
    Optional<List<TransactionType>> findActiveUserAndSystemTypes(@Param("userId") Long userId);

    @Query("""
    SELECT COUNT(t) > 0
    FROM TransactionType t
    WHERE (t.user.id = :userId OR t.user IS NULL)
      AND t.label = :label
    """)
    boolean existsLabel(@Param("userId") Long userId,
                        @Param("label") String label);

    List<TransactionType> findByIsActiveTrue();

}
