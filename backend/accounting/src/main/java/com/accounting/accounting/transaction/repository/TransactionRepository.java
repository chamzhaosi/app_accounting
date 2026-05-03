package com.accounting.accounting.transaction.repository;

import com.accounting.accounting.common.repository.BaseRepositoryItf;
import com.accounting.accounting.transaction.dto.common.TransactionBudgetSummary;
import com.accounting.accounting.transaction.dto.common.TransactionCategoriesSummary;
import com.accounting.accounting.transaction.dto.common.TransactionSummary;
import com.accounting.accounting.transaction.entity.Transaction;
import lombok.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
                  ORDER BY t.txnDate, t.createdAt DESC
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

  @Query(
          """
                  SELECT COUNT(t)
                  FROM #{#entityName} t
                  WHERE t.user.id = :userId
                    AND t.account.id = :accId
                    AND t.deletedAt IS NULL
                  """
  )
  int countTransactionByAccId(@Param("userId") Long userId,
                              @Param("accId") Long accId);


  @Query(
          """
                  SELECT t
                  FROM #{#entityName} t
                  WHERE t.user.id = :userId
                    AND t.id <> :txnId
                    AND t.transferGroupId = :transferGroupId
                    AND t.deletedAt IS NULL
                  """
  )
  Optional<Transaction> findByTransferGroupId(@Param("userId") Long userId,
                                              @Param("txnId") Long txnId,
                                              @Param("transferGroupId") String transferGroupId);

  @Query(
          """
                  SELECT t
                  FROM #{#entityName} t
                  WHERE t.user.id = :userId
                    AND t.transferGroupId IN :transferGroupIds
                    AND t.deletedAt IS NULL
                  """
  )
  List<Transaction> findByTransferGroupIds(@Param("userId") Long userId,
                                           @Param("transferGroupIds") List<String> transferGroupIds);


  @Query("""
              SELECT new com.accounting.accounting.transaction.dto.common.TransactionSummary(
                  COALESCE(SUM(CASE WHEN tt.nature = 'IN' THEN t.amount ELSE 0 END), 0),
                  COALESCE(SUM(CASE WHEN tt.nature = 'EXP' THEN t.amount ELSE 0 END), 0)
              )
              FROM Transaction t
              JOIN t.transactionType tt
              WHERE t.user.id = :userId
                AND t.txnDate BETWEEN :from AND :to
                AND t.deletedAt IS NULL
          """)
  TransactionSummary getTransactionSummaryByPeriod(
          @Param("userId") Long userId,
          @Param("from") LocalDate from,
          @Param("to") LocalDate to
  );

  @Query("""
          SELECT t
          FROM Transaction t
          JOIN t.transactionType tt
          WHERE tt.nature = 'EXP'
            AND t.user.id = :userId
            AND t.txnDate BETWEEN :from AND :to
            AND t.deletedAt IS NULL
          """)
  List<Transaction> findTopExpenseTransactions(
          @Param("userId") Long userId,
          @Param("from") LocalDate from,
          @Param("to") LocalDate to,
          Pageable pageable
  );

  @Query("""
              SELECT new com.accounting.accounting.transaction.dto.common.TransactionCategoriesSummary(
                  t.category,
                  SUM(t.amount)
              )
              FROM Transaction t
              JOIN t.transactionType tt
              WHERE tt.nature = :nature
                AND t.user.id = :userId
                AND t.txnDate BETWEEN :from AND :to
                AND t.deletedAt IS NULL
              GROUP BY t.category
              ORDER BY SUM(t.amount) DESC
          """)
  List<TransactionCategoriesSummary> findTransactionCategoriesSummary(
          @Param("userId") Long userId,
          @Param("nature") String nature,
          @Param("from") LocalDate from,
          @Param("to") LocalDate to
  );

  @Query("""
        SELECT new com.accounting.accounting.transaction.dto.common.TransactionBudgetSummary(
            bc.category,
            COALESCE(SUM(t.amount), 0),
            bc.amount
        )
        FROM BudgetCategory bc
        LEFT JOIN Transaction t
            ON t.category = bc.category
           AND t.user.id = :userId
           AND t.txnDate BETWEEN :from AND :to
           AND t.deletedAt IS NULL
        WHERE bc.budget.user.id = :userId
          AND bc.deletedAt IS NULL
        GROUP BY bc.category, bc.amount
    """)
  List<TransactionBudgetSummary> findTransactionBudgetSummary(
          @Param("userId") Long userId,
          @Param("from") LocalDate from,
          @Param("to") LocalDate to
  );
}