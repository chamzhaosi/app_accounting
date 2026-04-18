package com.accounting.accounting.transaction.repository;

import com.accounting.accounting.common.repository.BaseRepositoryItf;
import com.accounting.accounting.transaction.entity.Transaction;
import lombok.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface TransactionRepository extends BaseRepositoryItf<Transaction, Long> {

  @Query(
          """
          SELECT t
          FROM #{#entityName} t
          WHERE t.user.id = :userId
            AND (:txnTypeId IS NULL OR t.transactionType.id = :txnTypeId)
            AND (:ctgrId IS NULL OR t.category.id = :ctgrId)
            AND (:accId IS NULL OR t.account.id = :accId)
            AND (:description IS NULL OR
              LOWER(t.description) LIKE LOWER(CONCAT('%', :description, '%')))
            AND (:txnDate IS NULL OR t.txnDate = :txnDate)
            AND (:sttTxnDate IS NULL OR :endTxnDate IS NULL OR
              t.txnDate BETWEEN :sttTxnDate AND :endTxnDate)
            AND t.deletedAt IS NULL
          """
  )
  Page<@NonNull Transaction> search(@Param("userId") Long userId,
                                    @Nullable @Param("txnTypeId") Long txnTypeId,
                                    @Nullable @Param("ctgrId") Long ctgrId,
                                    @Nullable @Param("accId") Long accId,
                                    @Nullable @Param("description") String description,
                                    @Nullable @Param("txnDate") LocalDate txnDate,
                                    @Nullable @Param("sttTxnDate") LocalDate sttTxnDate,
                                    @Nullable @Param("endTxnDate") LocalDate endTxnDate,
                                    Pageable pageable);
}
