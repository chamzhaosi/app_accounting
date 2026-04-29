package com.accounting.accounting.budget.service;

import com.accounting.accounting.budget.dto.BudgetCreateRequest;
import com.accounting.accounting.budget.dto.BudgetResponse;
import com.accounting.accounting.budget.dto.BudgetUpdateRequest;
import com.accounting.accounting.budget.dto.common.BudgetCategoryRequest;
import com.accounting.accounting.budget.entity.Budget;
import com.accounting.accounting.budget.entity.BudgetCategory;
import com.accounting.accounting.budget.mapper.BudgetMapper;
import com.accounting.accounting.budget.repository.BudgetCategoriesRepository;
import com.accounting.accounting.budget.repository.BudgetRepository;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.category.service.CategoryService;
import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.common.service.CrudServiceItf;
import com.accounting.accounting.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetService implements
        CrudServiceItf.Create<BudgetResponse, BudgetCreateRequest>,
        CrudServiceItf.Update<BudgetResponse, BudgetUpdateRequest> {

  private final BudgetRepository budgetRepository;
  private final BudgetCategoriesRepository budgetCategoriesRepository;
  private final CategoryService categoryService;
  private final BudgetMapper budgetMapper;

  @Override
  @Transactional
  public BudgetResponse create(BudgetCreateRequest request){
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[BudgetService][Create] - Create new budget by user ({})", user.getEmail());
    checkBudgetExisting(user);

    List<Category> categories = getCategoriesFromRequest(user, request);
    BigDecimal totalBudget = getTotalBudgetFromRequest(request);
    Budget budget = saveNewBudgetIntoDB(new Budget(user, Common.getCurrentMonthYear(), totalBudget));
    Map<Long, BigDecimal> ctgrIdAmountMap = getCtrgIdAmountMap(request.getBudgetCategoriesList());
    List<BudgetCategory> budgetCategories = saveBudgetCategoriesIntoDB(categories.stream()
            .map(c -> new BudgetCategory(user, budget, c, ctgrIdAmountMap.get(c.getId()))).toList());

    return budgetMapper.toResponse(budget, budgetCategories);
  }

  public Optional<BudgetResponse> getBudget(){
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[BudgetService][Get Budget] - Get current month budget by user ({})", user.getEmail());
    Optional<Budget> budget = budgetRepository.findAllByYearMonth(user.getId(), Common.getCurrentMonthYear());

    if(budget.isPresent()){
      List<BudgetCategory> budgetCategories = budgetCategoriesRepository
              .findAllByBudgetId(budget.get().getId());
      return Optional.of(budgetMapper.toResponse(budget.get(), budgetCategories));
    }

    return Optional.empty();
  }

  @Override
  @Transactional
  public BudgetResponse update(BudgetUpdateRequest request){
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[BudgetService][Update Budget] - Update current month budget detail by user ({})", user.getEmail());

    Budget budget = budgetRepository.findById(user.getId(), request.getId())
            .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));

    List<BudgetCategory> budgetCategoryListInDB = budgetCategoriesRepository
            .findAllByBudgetId(budget.getId());
    Map<Long, BigDecimal> ctgrIdAmountReqMap = getCtrgIdAmountMap(request.getBudgetCategoryRequestList());
    LocalDateTime now = Common.getLocalDateTime(null);

    for (BudgetCategory budgetCategory : budgetCategoryListInDB){
        BigDecimal reqAmount = ctgrIdAmountReqMap.get(budgetCategory.getId());
        if(reqAmount != null){
          budgetCategory.setAmount(reqAmount);
        }else{
          budgetCategory.setDeletedAt(now);
          budgetCategory.setDeletedBy(user.getEmail());
        }
      ctgrIdAmountReqMap.remove(budgetCategory.getId());
    }

    List<Long> newCtgtIds = ctgrIdAmountReqMap.keySet().stream().toList();
    List<Category> categories = categoryService.getCategoriesByIds(user.getId(), newCtgtIds);
    List<BudgetCategory> budgetCategories = categories.stream()
            .map(c -> new BudgetCategory(user, budget, c, ctgrIdAmountReqMap.get(c.getId()))).toList();

    budgetCategoryListInDB.addAll(budgetCategories);
    budgetCategoriesRepository.saveAll(budgetCategoryListInDB);

    budget.setTotalBudget(request.getTotalBudget());
    budget.setIsActive(request.getIsActive());
    budgetRepository.save(budget);

    return budgetMapper.toResponse(budget, budgetCategoryListInDB);
  }

  private void checkBudgetExisting(User user){
    log.info("[BudgetService] - Check whether budget has been existing");
     budgetRepository.findAllByYearMonth(user.getId(), Common.getCurrentMonthYear()).ifPresent((b) -> {
       throw new InvalidArgumentException(ExceptionEnum.BUDGET_IS_EXISTING);
     });
  }

  private Map<Long, BigDecimal> getCtrgIdAmountMap (List<BudgetCategoryRequest> budgetCategoryRequestList){
    return budgetCategoryRequestList.stream()
            .collect(Collectors.toMap(BudgetCategoryRequest::getCtgr_id, BudgetCategoryRequest::getAmount, (oldVal, newVal) -> oldVal));
  }

  private BigDecimal getTotalBudgetFromRequest(@NotNull BudgetCreateRequest request){
    return request.getBudgetCategoriesList().stream()
            .map(BudgetCategoryRequest::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private List<Category> getCategoriesFromRequest(@NotNull User user, @NotNull BudgetCreateRequest request){
    List<Long> ctgtIds = request.getBudgetCategoriesList().stream().map(BudgetCategoryRequest::getCtgr_id).toList();
   return categoryService.getCategoriesByIds(user.getId(), ctgtIds);
  }

  @NotNull
  private Budget saveNewBudgetIntoDB(Budget budget){
    return budgetRepository.save(budget);
  }

  @NotNull
  private List<BudgetCategory> saveBudgetCategoriesIntoDB(List<BudgetCategory> budgetCategories){
    return budgetCategoriesRepository.saveAll(budgetCategories);
  }

}
