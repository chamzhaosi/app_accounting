package com.accounting.accounting.account.dto.acctype;

import com.accounting.accounting.account.entity.acctype.AccountType;
import com.accounting.accounting.common.dto.BaseResponseDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AccountTypeResponse extends BaseResponseDto {
    private String label;

    @JsonProperty("isActive")
    private boolean isActive;

    @JsonProperty("isCreatedBySystem")
    private boolean isCreatedBySystem;

    public AccountTypeResponse(AccountType accountType){
        super(accountType.getId(), accountType.getVrs());
        this.id = accountType.getId();
        this.label = accountType.getLabel();
        this.isActive = accountType.getIsActive();
        this.isCreatedBySystem = accountType.getUser() == null;
    }
}
