package com.accounting.accounting.budget.controller;

import com.accounting.accounting.budget.dto.BudgetCreateRequest;
import com.accounting.accounting.budget.dto.BudgetResponse;
import com.accounting.accounting.budget.dto.BudgetUpdateRequest;
import com.accounting.accounting.budget.service.BudgetService;
import com.accounting.accounting.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {
  private final BudgetService budgetService;

  @PostMapping("/create")
  public ApiResponse<BudgetResponse> create (@Valid @RequestBody BudgetCreateRequest request){
    BudgetResponse budgetResponse = budgetService.create(request);
    return ApiResponse.success(budgetResponse);
  }

  @GetMapping("/get-budget")
  public ApiResponse<BudgetResponse> getBudget(){
    BudgetResponse budgetResponse = budgetService.getBudget(null).orElse(null);
    return ApiResponse.success(budgetResponse);
  }

  @PutMapping("/update")
  public ApiResponse<BudgetResponse> update(@Valid @RequestBody BudgetUpdateRequest request){
    BudgetResponse budgetResponse = budgetService.update(request);
    return ApiResponse.success(budgetResponse);
  }
}
