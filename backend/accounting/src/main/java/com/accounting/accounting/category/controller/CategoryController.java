package com.accounting.accounting.category.controller;

import com.accounting.accounting.category.dto.*;
import com.accounting.accounting.category.service.CategoryService;
import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.common.response.ApiResponsePagination;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService service;

    @PostMapping("/create")
    public ApiResponse<CategoryResponse> create (@Valid @RequestBody CategoryCreateRequest request){
        CategoryResponse data = service.create(request);
        return ApiResponse.success(data);
    }

    @GetMapping("/list")
    public ApiResponsePagination<CategoryResponse> findAll (@Valid @RequestBody CategorySearchRequest request, Pageable pageable){
        Page<CategoryResponse> data = service.findAll(request, pageable);
        return ApiResponsePagination.success(data);
    }

    @PutMapping("/update")
    public ApiResponse<CategoryResponse> update (@Valid @RequestBody CategoryUpdateRequest request){
        CategoryResponse data = service.update(request);
        return ApiResponse.success(data);
    }

    @DeleteMapping("/delete")
    public ApiResponse<String> delete(@Valid @RequestBody CategoryDeleteRequest request){
        service.deleteByIds(request.getIds());
        return ApiResponse.success("Category(s) deleted successfully");
    }
}
