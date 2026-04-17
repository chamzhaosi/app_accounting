package com.accounting.accounting.account.mapper;

import com.accounting.accounting.account.dto.acctype.AccountTypeResponse;
import com.accounting.accounting.account.entity.acctype.AccountType;
import org.springframework.stereotype.Component;

@Component
public class AccountTypeMapper {
    public AccountTypeResponse toResponse(AccountType entities) {
        return new AccountTypeResponse(entities);
    }
}
