package com.accounting.accounting.transactionType.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TransactionTypeRequest {
    @NotBlank(message = "Type code is required")
    @Size(max = 20, message = "Type code must not exceed 20 characters")
    private String type_code;

    @NotBlank(message = "Display name is required")
    @Size(max = 20, message = "Display name must not exceed 20 characters")
    private String display_name;

    public String getType_code(){
        return type_code;
    }

    public String getDisplay_name(){
        return display_name;
    }
}
