package com.accounting.accounting.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CategoryRequest {
    @NotBlank(message = "label is required")
    @Size(max= 50, message = "labek must not exceed 50 characters")
    private String label;

    @Size(max= 100, message = "description must not exceed 100 characters")
    private String description;

    @NotNull(message = "type_id is required")
    private Long typeId;

    @NotNull(message = "isActive is required")
    private Boolean isActive = true;

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }


}
