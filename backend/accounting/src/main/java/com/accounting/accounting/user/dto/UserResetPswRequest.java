package com.accounting.accounting.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.jspecify.annotations.Nullable;

@Getter
@Setter
public class UserResetPswRequest {
  @NotBlank(message = "password is required")
  @Pattern(
      regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      message = "Password must be at least 8 characters, include uppercase, lowercase, number and special character"
  )
  private String password;

  @Nullable
  private String curPassword;
}
