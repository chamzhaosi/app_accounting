package com.accounting.accounting.account.dto.acctype;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor
public class AccountTypeDeleteRequest {
    @NotEmpty(message = "Ids are required")
    private List<@NotNull(message = "Id must not be null") Long> ids;
}
