package com.accounting.accounting.account.mapper;

import com.accounting.accounting.account.dto.AccountResponse;
import com.accounting.accounting.account.entity.Account;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper {
  public AccountResponse toResponse(Account account){
    return new AccountResponse(account);
  }
}
