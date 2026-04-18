package com.accounting.accounting.account.controller;

import com.accounting.accounting.account.dto.*;
import com.accounting.accounting.account.service.AccountService;
import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.common.response.ApiResponsePagination;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService service;

  @PostMapping("/create")
  public ApiResponse<AccountResponse> create (@Valid @RequestBody AccountCreateRequest request){
    AccountResponse data = service.create(request);
    return ApiResponse.success(data);
  }

  @GetMapping("/list")
  public ApiResponsePagination<AccountResponse> findAll (@Valid AccountSearchRequest request, Pageable pageable){
    Page<@NonNull AccountResponse> data = service.findAll(request, pageable);
    return ApiResponsePagination.success(data);
  }

  @PutMapping("/update")
  public ApiResponse<AccountResponse> update (@Valid @RequestBody AccountUpdateRequest request){
    AccountResponse data = service.update(request);
    return ApiResponse.success(data);
  }

  @DeleteMapping("/delete")
  public ApiResponse<String> delete(@Valid @RequestBody AccountDeleteRequest request){
    service.deleteByIds(request);
    return ApiResponse.success("Category(s) deleted successfully");
  }
}
