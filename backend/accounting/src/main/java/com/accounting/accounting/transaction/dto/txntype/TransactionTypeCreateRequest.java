package com.accounting.accounting.transaction.dto.txntype;

import com.accounting.accounting.common.enums.TransactionNatureEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.jspecify.annotations.Nullable;

@Getter
@Setter
@RequiredArgsConstructor
public class TransactionTypeCreateRequest {
    @NotBlank(message = "Label is required")
    @Size(max = 20, message = "Label must not exceed 20 characters")
    private String label;

    @Nullable
    private TransactionNatureEnum nature;
}
