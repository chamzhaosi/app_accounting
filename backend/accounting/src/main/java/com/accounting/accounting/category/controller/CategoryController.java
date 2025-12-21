package com.accounting.accounting.category.controller;

import com.accounting.accounting.category.dto.CategoryRequest;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.category.service.CategoryService;
import com.accounting.accounting.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ApiResponse<List<Category>> getByTypeId (@PathVariable Long typeId) {
        List<Category> crtList = service.findAllByTypeId(typeId);
        return ApiResponse.success(crtList);
    }

}
