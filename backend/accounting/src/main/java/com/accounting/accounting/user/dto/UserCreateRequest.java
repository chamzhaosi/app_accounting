package com.accounting.accounting.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequest extends UserResetPswRequest{
  @NotBlank(message = "email is required")
  @Size(max=100, message="email must not exceed 100 characters")
  @Email(message = "Invalid email format")
  private String email;
}
