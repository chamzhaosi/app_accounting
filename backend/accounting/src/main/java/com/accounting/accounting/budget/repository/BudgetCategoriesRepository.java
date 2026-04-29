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
          FROM #{#entityName} bc
          WHERE bc.budget.id = :budgetId
           AND bc.deletedAt IS NULL
          """)
  List<BudgetCategory> findAllByBudgetId(
          @Param("budgetId") Long budgetId
          );

  @Query("""
          SELECT bc
          FROM #{#entityName} bc
          WHERE bc.budget.user.id = :userId
           AND bc.budget.month = :month
           AND bc.category.id IN (:ctgrIds)
           AND bc.deletedAt IS NULL
          """)
  List<BudgetCategory> findByBudgetIdAndCategoryIds(
          @Param("userId") Long userId,
          @Param("month") LocalDate month,
          @Param("ctgrIds") List<Long> ctgrIds
  );
}
