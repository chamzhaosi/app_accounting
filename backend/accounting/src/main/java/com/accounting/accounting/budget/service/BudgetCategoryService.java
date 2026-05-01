package com.accounting.accounting.budget.service;

import com.accounting.accounting.budget.entity.BudgetCategory;
import com.accounting.accounting.budget.repository.BudgetCategoriesRepository;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetCategoryService {
  private final BudgetCategoriesRepository budgetCategoriesRepository;

  public void updateBudgetCategoryByCtgrId(User user, List<Long> ctgrIds, Boolean isDeleteOrInactive){
    log.info("[BudgetService][Update Budget Category] - Update budget category by user ({})", user.getEmail());
    if (ctgrIds == null || ctgrIds.isEmpty()) return;

    List<BudgetCategory> budgetCategories = budgetCategoriesRepository
            .findByBudgetIdAndCategoryIds(user.getId(), Common.getCurrentMonthYear(), ctgrIds);
    if(budgetCategories.isEmpty()) return;

    LocalDateTime deletedAt = isDeleteOrInactive ? Common.getLocalDateTime(null) : null;
    String deletedBy =  isDeleteOrInactive? user.getEmail() : null;
    budgetCategories.forEach(bc -> {
      bc.setDeletedAt(deletedAt);
      bc.setDeletedBy(deletedBy);
    });

    budgetCategoriesRepository.saveAll(budgetCategories);
  }
}
