package com.accounting.accounting.budget.repository;

import com.accounting.accounting.budget.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
  @Query("""
          SELECT b
          FROM #{#entityName} b
          WHERE b.user.id = :userId
            AND b.month = :month
          """)
  Optional<Budget> findAllByYearMonth(
          @Param("userId") Long userId,
          @Param("month") LocalDate month);

  @Query(
          """
          SELECT b
          FROM #{#entityName} b
          WHERE b.user.id = :userId
              AND b.id = :id
          """
  )
  Optional<Budget> findById(@Param("userId") Long userId,
                       @Param("id") Long id);
}
