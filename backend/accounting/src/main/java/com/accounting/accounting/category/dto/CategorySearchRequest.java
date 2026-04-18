package com.accounting.accounting.category.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class CategorySearchRequest {
    @Nullable
    private String label;

    @NotNull(message = "txn_type_id is required")
    private Long txnTypeId;

    @NotNull(message = "isActive is required")
    private Boolean isActive;
}
