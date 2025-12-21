package com.accounting.accounting.transactionType.controller;

import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.transactionType.entity.TransactionType;
import com.accounting.accounting.transactionType.service.TransactionTypeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/transaction_types")
public class TransactionTypeController {
    private final TransactionTypeService service;

    public TransactionTypeController(TransactionTypeService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<TransactionType>> getAll(){
        return ApiResponse.success(service.findAll());
    }

    @GetMapping("/{typeCode}")
    public ApiResponse<List<TransactionType>> getByTypeCode(@PathVariable String typeCode){
        return ApiResponse.success(service.findByTypeCode(typeCode));
    }
}
