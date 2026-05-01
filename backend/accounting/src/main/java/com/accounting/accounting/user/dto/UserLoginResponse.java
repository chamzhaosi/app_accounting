package com.accounting.accounting.user.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginResponse {
  @Nullable
  private String resetPswToken;

  @Nullable
  private String accessToken;

  @Nullable
  private String refreshToken;
}
