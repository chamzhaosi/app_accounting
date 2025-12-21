package com.accounting.accounting.transaction.controller;

import com.accounting.accounting.transaction.dto.TransactionRequest;
import com.accounting.accounting.transaction.entity.Transaction;
import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.transaction.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService service;

    public TransactionController(TransactionService service){
        this.service = service;
    }

    @PostMapping
    public ApiResponse<Transaction> create(@Valid @RequestBody TransactionRequest req){
        Transaction tx =  service.create(req);
        return ApiResponse.success(tx, "Transaction created successfully");
    }

    @GetMapping
    public ApiResponse<List<Transaction>> getAll(){
        return ApiResponse.success(service.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Transaction> getById(@PathVariable Long id){
        return ApiResponse.success(service.findById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Transaction> update(@PathVariable Long id, @Valid @RequestBody TransactionRequest req){
        return ApiResponse.success(service.update(id, req), "Transaction update successfully");
    }

    @DeleteMapping("/{id}")
    public  ApiResponse<String> delete(@PathVariable Long id){
        service.delete(id);
        return ApiResponse.success("Transaction deleted successfully");
    }
}
