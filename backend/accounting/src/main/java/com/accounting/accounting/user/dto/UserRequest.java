package com.accounting.accounting.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequest {
  @NotBlank(message = "email is required")
  @Size(max=100, message="email must not exceed 100 characters")
  @Email(message = "Invalid email format")
  private String email;

  @NotBlank(message = "password is required")
  @Pattern(
      regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      message = "Password must be at least 8 characters, include uppercase, lowercase, number and special character"
  )
  private String password;
}
