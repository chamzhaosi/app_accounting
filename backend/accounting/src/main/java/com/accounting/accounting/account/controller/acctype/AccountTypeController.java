package com.accounting.accounting.account.controller.acctype;

import com.accounting.accounting.account.dto.acctype.*;
import com.accounting.accounting.account.service.acctype.AccountTypeService;
import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.common.response.ApiResponsePagination;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/account_types")
public class AccountTypeController {
    private final AccountTypeService service;

    @PostMapping("/create")
    public ApiResponse<AccountTypeResponse> create (@Valid @RequestBody AccountTypeCreateRequest req){
        AccountTypeResponse accountTypeResponse = service.create(req);
        return ApiResponse.success(accountTypeResponse);
    }

    @GetMapping("/list")
    public ApiResponsePagination<AccountTypeResponse> list(@Valid AccountTypeSearchRequest request,
                                                           Pageable pageable){
        System.out.println(pageable.toString());
        Page<AccountTypeResponse> accountTypeResponse = service.findAll(request, pageable);
        return ApiResponsePagination.success(accountTypeResponse);
    }

    @PutMapping("/update")
    public ApiResponse<AccountTypeResponse> update (@Valid @RequestBody AccountTypeUpdateRequest req){
        AccountTypeResponse accountTypeResponse = service.update(req);
        return ApiResponse.success(accountTypeResponse);
    }

    @DeleteMapping("/delete")
    public ApiResponse<String> delete (@Valid @RequestBody AccountTypeDeleteRequest req){
        service.deleteByIds(req.getIds());
        return ApiResponse.success("Account type(s) deleted successfully" );
    }
}
