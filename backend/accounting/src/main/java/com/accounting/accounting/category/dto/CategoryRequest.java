package com.accounting.accounting.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {
    @NotBlank(message = "label is required")
    @Size(max= 50, message = "labek must not exceed 50 characters")
    private String label;

    @Size(max= 100, message = "description must not exceed 100 characters")
    private String description;

    @NotNull(message = "txn_type_id is required")
    private Long txnTypeId;

    @NotNull(message = "isActive is required")
    private Boolean isActive = true;
}
