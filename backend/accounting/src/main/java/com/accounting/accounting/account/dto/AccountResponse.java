package com.accounting.accounting.account.dto;

import com.accounting.accounting.account.dto.acctype.AccountTypeResponse;
import com.accounting.accounting.account.entity.Account;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AccountResponse {
  private Long id;
  private String label;
  private String description;
  private AccountTypeResponse accType;
  @JsonProperty("isActive")
  private Boolean isActive;

  public AccountResponse(Account account){
    this.id = account.getId();
    this.label = account.getLabel();
    this.description = account.getDescription();
    this.accType = new AccountTypeResponse(account.getType());
    this.isActive =  account.getIsActive();
  }
}
