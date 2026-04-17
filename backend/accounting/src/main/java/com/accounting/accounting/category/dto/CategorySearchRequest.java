package com.accounting.accounting.category.dto;

import jakarta.annotation.Nullable;
import lombok.*;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class CategorySearchRequest {
    @Nullable
    private String label;

    @NonNull
    private Long txnTypeId;

    @NonNull
    private Boolean isActive;
}
