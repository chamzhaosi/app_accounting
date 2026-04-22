package com.accounting.accounting.transaction.controller;

import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.common.response.ApiResponsePagination;
import com.accounting.accounting.transaction.dto.adjustment.TransactionAdjustResponse;
import com.accounting.accounting.transaction.dto.adjustment.TransactionUpdateAdjustRequest;
import com.accounting.accounting.transaction.dto.transaction.*;
import com.accounting.accounting.transaction.dto.transfer.TransactionsCreateTransferRequest;
import com.accounting.accounting.transaction.dto.transfer.TransactionsTransferResponse;
import com.accounting.accounting.transaction.dto.transfer.TransactionsUpdateTransferRequest;
import com.accounting.accounting.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService service;

  @PostMapping("/create")
  public ApiResponse<TransactionResponse> create (@Valid @RequestBody TransactionCreateRequest request){
    TransactionResponse data = service.create(request);
    return ApiResponse.success(data);
  }

  @PostMapping("/transfer")
  public ApiResponse<TransactionsTransferResponse> transfer (@Valid @RequestBody TransactionsCreateTransferRequest request){
    TransactionsTransferResponse data = service.transfer(request);
    return ApiResponse.success(data);
  }

  @GetMapping("/list")
  public ApiResponsePagination<TransactionResponse> findAll (@Valid TransactionSearchRequest request, Pageable pageable){
    Page<@NonNull TransactionResponse> data = service.findAll(request, pageable);
    return ApiResponsePagination.success(data);
  }

  @GetMapping("/getTxnById/{id}")
  public ApiResponse<Object> getTxnDtlById (@PathVariable Long id){
    Object data = service.getTxnDtlById(id);
    return ApiResponse.success(data);
  }

  @PutMapping("/update")
  public ApiResponse<TransactionResponse> update (@Valid @RequestBody TransactionUpdateRequest request){
    TransactionResponse data = service.update(request);
    return ApiResponse.success(data);
  }

  @PutMapping("/update-transfer")
  public ApiResponse<TransactionsTransferResponse> updateTransfer(@Valid @RequestBody TransactionsUpdateTransferRequest request){
    TransactionsTransferResponse data = service.updateTransfer(request);
    return ApiResponse.success(data);
  }

  @PutMapping("/update-adjust")
  public ApiResponse<TransactionAdjustResponse> updateAdjust(@Valid @RequestBody TransactionUpdateAdjustRequest request){
    TransactionAdjustResponse data = service.updateAdjust(request);
    return ApiResponse.success(data);
  }

  @DeleteMapping("/delete")
  public ApiResponse<String> delete(@Valid @RequestBody TransactionDeleteRequest request){
    service.deleteByIds(request);
    return ApiResponse.success("Transaction(s) deleted successfully");
  }
}
