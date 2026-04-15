package com.accounting.accounting.transaction.dto;

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
@NoArgsConstructor
public class TransactionTypeCreateRequest {
    @NotBlank(message = "Label is required")
    @Size(max = 20, message = "Label must not exceed 20 characters")
    private String label;
}
