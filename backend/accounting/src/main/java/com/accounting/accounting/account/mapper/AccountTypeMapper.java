package com.accounting.accounting.account.mapper;

import com.accounting.accounting.account.dto.acctype.AccountTypeResponse;
import com.accounting.accounting.account.entity.acctype.AccountType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AccountTypeMapper {
    public List<AccountTypeResponse> toResponseList(List<AccountType> entities) {
        return entities.stream()
                .map(AccountTypeResponse::new)
                .toList();
    }

    public AccountTypeResponse toResponse(AccountType entities) {
        return new AccountTypeResponse(entities);
    }
}
