package com.accounting.accounting.category.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class CategoryCreateRequest {
    @NotBlank(message = "label is required")
    @Size(max= 50, message = "label must not exceed 50 characters")
    private String label;

    @Nullable
    @Size(max= 100, message = "description must not exceed 100 characters")
    private String description;

    @NotNull(message = "txn_type_id is required")
    private Long txnTypeId;
}
