package com.accounting.accounting.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequest extends UserResetPswRequest{
  @NotBlank(message = "email is required")
  @Size(max=100, message="email must not exceed 100 characters")
  @Email(message = "Invalid email format")
  @Pattern(
          regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
          message = "Email must contain valid domain (e.g. .com)"
  )
  private String email;
}
