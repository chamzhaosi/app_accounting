package com.accounting.accounting.category.dto;

import com.accounting.accounting.category.entity.Category;

public class CategoryResponse {
    private Long id;
    private String label;
    private String description;
    private String typeId;
    private Boolean active;

    public static CategoryResponse from(Category category){
        CategoryResponse dto = new CategoryResponse();
        dto.setId(category.getId());
        dto.setLabel(category.getLabel());
        dto.setDescription(category.getDescription());
        dto.setTypeId((category.getType()));
        dto.setActive(category.getActive());

        return dto;
    }


    public void setLabel(String label) {
        this.label = label;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTypeId(String typeId) {
        this.typeId = typeId;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public String getTypeId() {
        return typeId;
    }

    public Boolean getActive() {
        return active;
    }
}
