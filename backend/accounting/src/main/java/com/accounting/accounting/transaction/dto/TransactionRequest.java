package com.accounting.accounting.transaction.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionRequest {
    @NotBlank(message = "description is required")
    @Size(max = 100, message = "description must not exceed 100 characters")
    private String description;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be greater than zero")
    @Digits(integer = 8, fraction = 2, message = "amount must have at most 8 digits and 2 decimals")
    private BigDecimal amount;
    private boolean deleted;
}
