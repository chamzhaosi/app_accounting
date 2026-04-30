package com.accounting.accounting.budget.service;

import com.accounting.accounting.budget.dto.BudgetCreateRequest;
import com.accounting.accounting.budget.dto.BudgetResponse;
import com.accounting.accounting.budget.dto.BudgetUpdateRequest;
import com.accounting.accounting.budget.dto.common.BudgetCategoryBaseRequest;
import com.accounting.accounting.budget.dto.common.BudgetCategoryCreateRequest;
import com.accounting.accounting.budget.dto.common.BudgetCategoryUpdateRequest;
import com.accounting.accounting.budget.entity.Budget;
import com.accounting.accounting.budget.entity.BudgetCategory;
import com.accounting.accounting.budget.mapper.BudgetMapper;
import com.accounting.accounting.budget.repository.BudgetCategoriesRepository;
import com.accounting.accounting.budget.repository.BudgetRepository;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.category.service.CategoryService;
import com.accounting.accounting.common.dto.BaseDto;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
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

    BigDecimal totalBudget = getTotalBudgetFromRequest(request.getBudgetCategoriesList());
    Budget budget = saveNewBudgetIntoDB(new Budget(user, Common.getCurrentMonthYear(), totalBudget));
    List<BudgetCategory> budgetCategories = addNewBudgetCategory(user, budget, request.getBudgetCategoriesList());
    budgetCategoriesRepository.saveAll(budgetCategories);

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
    Common.validateVersionMatch(request, budget);

    List<BudgetCategory> budgetCategoryListInDB = budgetCategoriesRepository
        .findAllByBudgetId(budget.getId());

    List<BudgetCategory> activeBudgetCategoryList = updateExistBudgetCategory(user, budgetCategoryListInDB, request.getExistBudgetCategoriesList());
    List<BudgetCategory> newBudgetCategoryList = addNewBudgetCategory(user, budget, request.getNewBudgetCategoriesList());

    activeBudgetCategoryList.addAll(newBudgetCategoryList);
    budgetCategoriesRepository.saveAll(activeBudgetCategoryList);

    budget.setTotalBudget(request.getTotalBudget());
    budget.setIsActive(request.getIsActive());
    budgetRepository.save(budget);

    return budgetMapper.toResponse(budget, activeBudgetCategoryList);
  }

  @NotNull
  private List<BudgetCategory> updateExistBudgetCategory(User user, List<BudgetCategory> budgetCategoryListInDB,
                                                         List<BudgetCategoryUpdateRequest> existBudgetCategoriesList){
    if(existBudgetCategoriesList == null || existBudgetCategoriesList.isEmpty()) return new ArrayList<>();

    List<BudgetCategory> activeBudgetCategoryList = new ArrayList<>();
    Map<Long, BudgetCategoryUpdateRequest> longBudgetCategoryUpdateRequestMap = existBudgetCategoriesList.stream().collect(Collectors.toMap(
            BaseDto::getId, Function.identity()
    ));

    for (BudgetCategory budgetCategory: budgetCategoryListInDB){
      BudgetCategoryUpdateRequest budgetCategoryUpdateRequest = longBudgetCategoryUpdateRequestMap.get(budgetCategory.getId());
      Common.validateVersionMatch(budgetCategoryUpdateRequest, budgetCategory);

      BigDecimal reqAmount = budgetCategoryUpdateRequest.getAmount();
      LocalDateTime now = Common.getLocalDateTime(null);
        if(reqAmount != null){
          budgetCategory.setAmount(reqAmount);
          activeBudgetCategoryList.add(budgetCategory);
        }else{
          budgetCategory.setDeletedAt(now);
          budgetCategory.setDeletedBy(user.getEmail());
        }
    }
    return activeBudgetCategoryList;
  }

  @NotNull
  private List<BudgetCategory> addNewBudgetCategory(User user,  Budget budget, List<BudgetCategoryCreateRequest> newBudgetCategoriesList){
    if(newBudgetCategoriesList == null || newBudgetCategoriesList.isEmpty()) return new ArrayList<>();

    List<Category> categories = getCategoriesFromRequest(user, newBudgetCategoriesList);
    Map<Long, BigDecimal> ctgrIdAmountMap = getCtrgIdAmountMap(newBudgetCategoriesList);
    return saveBudgetCategoriesIntoDB(categories.stream()
            .map(c -> new BudgetCategory(user, budget, c, ctgrIdAmountMap.get(c.getId()))).toList());

  }

  private void checkBudgetExisting(@NotNull User user){
    log.info("[BudgetService] - Check whether budget has been existing");
    budgetRepository.findAllByYearMonth(user.getId(), Common.getCurrentMonthYear()).ifPresent((b) -> {
     throw new InvalidArgumentException(ExceptionEnum.BUDGET_IS_EXISTING);
    });
  }

  private Map<Long, BigDecimal> getCtrgIdAmountMap (@NotNull List<? extends BudgetCategoryBaseRequest> budgetCategoryRequestList){
    return budgetCategoryRequestList.stream()
            .collect(Collectors.toMap(BudgetCategoryBaseRequest::getCtgrId, BudgetCategoryBaseRequest::getAmount, (oldVal, newVal) -> oldVal));
  }

  private BigDecimal getTotalBudgetFromRequest(@NotNull  List<?extends BudgetCategoryBaseRequest> budgetCategoriesList){
    return budgetCategoriesList.stream()
            .map(BudgetCategoryBaseRequest::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private List<Category> getCategoriesFromRequest(@NotNull User user, @NotNull List<?extends BudgetCategoryBaseRequest> budgetCategoriesList){
    List<Long> ctgtIds = budgetCategoriesList.stream().map(BudgetCategoryBaseRequest::getCtgrId).toList();
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
