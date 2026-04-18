package com.accounting.accounting.transaction.controller.txntype;

import com.accounting.accounting.common.response.ApiResponsePagination;
import com.accounting.accounting.transaction.dto.txntype.*;
import com.accounting.accounting.transaction.service.txntype.TransactionTypeService;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/transaction_types")
public class TransactionTypeController {
    private final TransactionTypeService service;

    @GetMapping("/list")
    public ApiResponsePagination<TransactionTypeResponse> list(@Valid TransactionTypeSearchRequest request,
                                                               Pageable pageable){
        Page<@NonNull TransactionTypeResponse> transactionTypeResponse = service.findAll(request, pageable);
        return ApiResponsePagination.success(transactionTypeResponse);
    }
}
