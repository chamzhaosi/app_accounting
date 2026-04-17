package com.accounting.accounting.account.dto.acctype;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class AccountTypeSearchRequest {
    @NotNull(message = "isActive is required")
    private Boolean isActive;
}
