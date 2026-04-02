package com.accounting.accounting.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginRequest {
  @NotBlank(message = "email is required")
  @Email(message = "Invalid email format")
  private String email;

  @NotBlank(message = "password is required")
  private String password;
}
