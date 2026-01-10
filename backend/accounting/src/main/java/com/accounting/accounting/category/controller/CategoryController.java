package com.accounting.accounting.category.controller;

import com.accounting.accounting.category.dto.CategoryRequest;
import com.accounting.accounting.category.dto.CategoryResponse;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.category.service.CategoryService;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.common.response.ApiResponsePagination;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.jspecify.annotations.NonNull;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService service;

    public CategoryController(CategoryService service){
        this.service = service;
    }

    @PostMapping
    public ApiResponse<Category> create(@Valid @RequestBody CategoryRequest req){
        Category crt = service.create(req);
        return ApiResponse.success(crt, "Category created successfully.");
    }

    @GetMapping("/{typeId}")
    public ApiResponsePagination<CategoryResponse> find (@PathVariable Long typeId,
                                                                @RequestParam(defaultValue = "") String param,
                                                                @RequestParam(required = false) Boolean  active,
                                                                @RequestParam(defaultValue = "1") int page,
                                                                @RequestParam(defaultValue = "10") int size,
                                                                @RequestParam(defaultValue = "id,desc") String sort
                                                           ) {

        Page<@NonNull Category> result = service.find(typeId, param, active ,page, size, sort);
        return Common.toApiResponsePage(result, CategoryResponse::from);
    }

    @PutMapping("/{categoryId}")
    public ApiResponse<Category> update (@PathVariable Long categoryId, @Valid @RequestBody CategoryRequest request){
        Category updatedCategory = service.update(categoryId, request);
        return  ApiResponse.success(updatedCategory, "Update successfully");
    }

}
