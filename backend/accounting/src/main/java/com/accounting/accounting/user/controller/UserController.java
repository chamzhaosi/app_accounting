package com.accounting.accounting.user.controller;

import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.user.dto.UserCreateRequest;
import com.accounting.accounting.user.dto.UserLoginRequest;
import com.accounting.accounting.user.dto.UserResetPswRequest;
import com.accounting.accounting.user.entity.User;
import com.accounting.accounting.user.service.UserService;
import jakarta.validation.Valid;
import java.util.Optional;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService service;

  @PostMapping("/create")
  public ApiResponse<String> create(@Valid @RequestBody UserCreateRequest req){
    service.create(req);
    return ApiResponse.success("User created successfully");
  }

  @PostMapping("/login")
  public ApiResponse<String> login(@Valid @RequestBody UserLoginRequest req){
    Optional<String> result = service.login(req);

    return result.map(s -> ApiResponse.success(s, "Password has expired."))
        .orElseGet(() -> ApiResponse.success("User login successfully"));
  }

  @PostMapping("/reset-password/{token}")
  public ApiResponse<String> resetPassword(@Valid @PathVariable String token, @RequestBody UserResetPswRequest req){
    service.resetPassword(token, req);
    return ApiResponse.success("Password reset successfully");
  }

}
