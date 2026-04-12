package com.accounting.accounting.category.dto;

import com.accounting.accounting.category.entity.Category;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryResponse {
    private Long id;
    private String label;
    private String description;
    private Long typeId;
    private Boolean active;

    public static CategoryResponse from(Category category){
        CategoryResponse dto = new CategoryResponse();
        dto.setId(category.getId());
        dto.setLabel(category.getLabel());
        dto.setDescription(category.getDescription());
        dto.setTypeId((category.getType().getId()));
        dto.setActive(category.getIsActive());
        return dto;
    }
}
