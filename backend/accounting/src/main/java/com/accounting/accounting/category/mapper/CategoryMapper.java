package com.accounting.accounting.category.mapper;

import com.accounting.accounting.category.dto.CategoryResponse;
import com.accounting.accounting.category.entity.Category;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CategoryMapper {
    public CategoryResponse toResponse(Category entity){
        return new CategoryResponse(entity);
    }
}
