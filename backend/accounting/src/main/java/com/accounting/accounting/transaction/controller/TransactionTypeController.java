package com.accounting.accounting.transaction.controller;

import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.transaction.dto.TransactionTypeCreateRequest;
import com.accounting.accounting.transaction.dto.TransactionTypeResponse;
import com.accounting.accounting.transaction.entity.TransactionType;
import com.accounting.accounting.transaction.service.TransactionTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/transaction_types")
@RequiredArgsConstructor
public class TransactionTypeController {
    private final TransactionTypeService service;

    @PostMapping("/create")
    public ApiResponse<TransactionTypeResponse> create (@Valid @RequestBody TransactionTypeCreateRequest req){
        TransactionTypeResponse transactionTypeResponse = service.create(req);
        return ApiResponse.success(transactionTypeResponse);
    }

    @GetMapping("/list-all")
    public ApiResponse<List<TransactionTypeResponse>> listAll (){
        List<TransactionTypeResponse> transactionTypeResponse = service.findAll();
        return ApiResponse.success(transactionTypeResponse);
    }

    @GetMapping("/list-all-active")
    public ApiResponse<List<TransactionTypeResponse>> listAllActive (){
        List<TransactionTypeResponse> transactionTypeResponse = service.findAllActive();
        return ApiResponse.success(transactionTypeResponse);
    }

    @PutMapping("/")

}
