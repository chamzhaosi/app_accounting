package com.accounting.accounting.transaction.controller.txntype;

import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.common.response.ApiResponsePagination;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeCreateRequest;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeDeleteRequest;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeResponse;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeUpdateRequest;
import com.accounting.accounting.transaction.service.txntype.TransactionTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/transaction_types")
public class TransactionTypeController {
    private final TransactionTypeService service;

    @PostMapping("/create")
    public ApiResponse<TransactionTypeResponse> create (@Valid @RequestBody TransactionTypeCreateRequest req){
        TransactionTypeResponse transactionTypeResponse = service.create(req);
        return ApiResponse.success(transactionTypeResponse);
    }

    @GetMapping("/list-all")
    public ApiResponsePagination<TransactionTypeResponse> listAll (Pageable pageable){
        System.out.println(pageable.toString());
        Page<TransactionTypeResponse> transactionTypeResponse = service.findAll(pageable);
        return ApiResponsePagination.success(transactionTypeResponse);
    }

    @GetMapping("/list-all-active")
    public ApiResponsePagination<TransactionTypeResponse> listAllActive (Pageable pageable){
        Page<TransactionTypeResponse> transactionTypeResponse = service.findAllActive(pageable);
        return ApiResponsePagination.success(transactionTypeResponse);
    }

    @PutMapping("/update")
    public ApiResponse<TransactionTypeResponse> updateTnxTypeById (@Valid @RequestBody TransactionTypeUpdateRequest req){
        TransactionTypeResponse transactionTypeResponse = service.update(req);
        return ApiResponse.success(transactionTypeResponse);
    }

    @DeleteMapping("/delete")
    public ApiResponse<String> delete (@Valid @RequestBody TransactionTypeDeleteRequest req){
        service.deleteByIds(req.getIds());
        return ApiResponse.success("Transaction type(s) deleted successfully" );
    }
}
