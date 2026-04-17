package com.accounting.accounting.transaction.dto.txntype;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class TransactionTypeUpdateRequest{
    @NotNull(message = "Id is required")
    private Long id;

    @NotBlank(message = "Label is required")
    @Size(max = 20, message = "Label must not exceed 20 characters")
    private String label;

    @NotNull(message = "Status is required")
    private boolean isActive;
}
