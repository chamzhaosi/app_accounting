package com.accounting.accounting.transaction.repository.txntype;

import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@NullMarked
public interface TransactionTypeRepository extends JpaRepository<TransactionType, Long> {

    @Query("""
    SELECT t
    FROM TransactionType t
    WHERE (t.user.id = :userId OR t.user IS NULL)
        AND t.isActive = :isActive
        AND t.deletedAt IS NULL
    """)
    Page<TransactionType> findAll(@Param("userId") Long userId,
                                  @Param("isActive") Boolean isActive,
                                  Pageable pageable
                                  );

    @Query("""
            SELECT t
            FROM TransactionType t
            WHERE (t.user.id = :userId OR t.user IS NULL)
                AND t.id = :txnTypeId
                AND t.deletedAt IS NULL
            """)
    Optional<TransactionType> findById(@Param("userId") Long userId,
                             @Param("txnTypeId") Long txnTypeId);

    Optional<TransactionType> findByLabel(String label);
}

