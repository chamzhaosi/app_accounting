package com.accounting.accounting.transaction.controller;

import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.transaction.entity.TransactionType;
import com.accounting.accounting.transaction.service.TransactionTypeService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/transaction_types")
public class TransactionTypeController {
    private final TransactionTypeService service;

    public TransactionTypeController(TransactionTypeService service) {
        this.service = service;
    }

    @GetMapping("/list")
    public ApiResponse<List<TransactionType>> getAll(Authentication authentication){
        System.out.println(authentication.getName());
        return ApiResponse.success(service.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<TransactionType> getByTypeId(@PathVariable Long id){
        return ApiResponse.success(service.findById(id));
    }
}
