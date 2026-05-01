package com.accounting.accounting.account.dto.acctype;

import com.accounting.accounting.common.dto.BaseDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class AccountTypeUpdateRequest implements BaseDto {
    private Long id;
    private Long vrs;

    @NotBlank(message = "Label is required")
    @Size(max = 20, message = "Label must not exceed 20 characters")
    private String label;

    @NotNull(message = "Status is required")
    private boolean isActive;
}
