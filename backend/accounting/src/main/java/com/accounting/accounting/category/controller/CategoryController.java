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
    public ApiResponsePagination<CategoryResponse> getByTypeId (@PathVariable Long typeId, @RequestParam(defaultValue = "1") int page,
                                                                @RequestParam(defaultValue = "10") int size,
                                                                @RequestParam(defaultValue = "id,desc") String sort
                                                           ) {

        Page<@NonNull Category> result = service.findAllByTypeId(typeId, page, size, sort);
        return Common.toApiResponsePage(result, CategoryResponse::from);
    }

    @GetMapping("/search/{typeId}")
    public ApiResponsePagination<CategoryResponse> search (@PathVariable Long typeId, @RequestParam(defaultValue = "") String param,
                                                           @RequestParam(defaultValue = "1") int page,
                                                           @RequestParam(defaultValue = "10") int size,
                                                           @RequestParam(defaultValue = "id,desc") String sort
                                                           ){

        Page<@NonNull Category> result = service.findAllByTypeIdWithParams(typeId, param, page, size, sort);
        return Common.toApiResponsePage(result, CategoryResponse::from);
    }

    @GetMapping("/active/{typeId}")
    public ApiResponsePagination<CategoryResponse> getActiveByTypeId (@PathVariable Long typeId, @RequestParam(defaultValue = "") String param,
                                                           @RequestParam(defaultValue = "1") int page,
                                                           @RequestParam(defaultValue = "10") int size,
                                                           @RequestParam(defaultValue = "id,desc") String sort
    ){

        Page<@NonNull Category> result = service.findAllByTypeIdWithActive(typeId, page, size, sort);
        return Common.toApiResponsePage(result, CategoryResponse::from);
    }

    @PutMapping("/{categoryId}")
    public ApiResponse<Category> updateCategoryById (@PathVariable Long categoryId, @Valid @RequestBody CategoryRequest request){
        Category updatedCategory = service.updateById(categoryId, request);
        return  ApiResponse.success(updatedCategory, "Update successfully");
    }

}
