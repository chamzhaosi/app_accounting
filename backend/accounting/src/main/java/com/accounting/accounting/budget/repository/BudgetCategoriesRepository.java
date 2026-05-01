package com.accounting.accounting.budget.repository;

import com.accounting.accounting.budget.entity.BudgetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BudgetCategoriesRepository extends JpaRepository<BudgetCategory, Long> {

  @Query("""
          SELECT bc
          FROM BudgetCategory bc
          WHERE bc.budget.id = :budgetId
           AND bc.deletedAt IS NULL
          """)
  List<BudgetCategory> findAllByBudgetId(
          @Param("budgetId") Long budgetId
          );

  @Query("""
    SELECT bc
    FROM BudgetCategory bc
    WHERE bc.budget.user.id = :userId
      AND bc.budget.month = :month
      AND bc.category.id IN :ctgrIds
      AND bc.id = (
          SELECT MAX(bc2.id)
          FROM BudgetCategory bc2
          WHERE bc2.budget.user.id = :userId
            AND bc2.budget.month = :month
            AND bc2.category.id = bc.category.id
      )
""")
  List<BudgetCategory> findByBudgetIdAndCategoryIds(
          @Param("userId") Long userId,
          @Param("month") LocalDate month,
          @Param("ctgrIds") List<Long> ctgrIds
  );


  @Query("""
          SELECT bc
          FROM BudgetCategory bc
          WHERE bc.budget.id IN (:budgetId)
           AND bc.deletedAt IS NULL
          """)
  List<BudgetCategory> findAllByListBudgetId(@Param("budgetId") List<Long> budgetId);
}
