package com.accounting.accounting.transaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionTypeRequest {
    @NotBlank(message = "Label is required")
    @Size(max = 20, message = "Label must not exceed 20 characters")
    private String label;
}
