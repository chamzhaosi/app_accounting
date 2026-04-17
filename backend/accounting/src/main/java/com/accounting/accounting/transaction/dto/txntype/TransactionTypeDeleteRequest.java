package com.accounting.accounting.transaction.dto.txntype;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor
public class TransactionTypeDeleteRequest {
    @NotEmpty(message = "Ids are required")
    private List<@NotNull(message = "Id must not be null") Long> ids;
}
