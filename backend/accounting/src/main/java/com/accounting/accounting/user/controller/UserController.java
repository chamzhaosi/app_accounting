package com.accounting.accounting.user.controller;

import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.user.dto.UserCreateRequest;
import com.accounting.accounting.user.dto.UserLoginRequest;
import com.accounting.accounting.user.dto.UserLoginResponse;
import com.accounting.accounting.user.dto.UserResetPswRequest;
import com.accounting.accounting.user.service.UserService;
import com.accounting.accounting.user.service.UserServiceUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.Optional;

import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
  public ResponseEntity<@NonNull ApiResponse<String>> login(@Valid @RequestBody UserLoginRequest req){
    UserLoginResponse result = service.login(req);

    if(result.getResetPswToken() != null){
      return ResponseEntity.ok().body(ApiResponse.success(result.getResetPswToken(), "Password has expired."));
    }

    HttpHeaders headers = UserServiceUtils.genAccessAndRefreshCookies(result.getAccessToken(), result.getRefreshToken());
    return ResponseEntity.ok()
        .headers(headers)
        .body(ApiResponse.success("User login successfully"));
  }

  @PostMapping("/reset-password/{token}")
  public ApiResponse<String> resetPasswordWithToken(@Valid @PathVariable String token, @RequestBody UserResetPswRequest req){
    service.resetPasswordWithToken(token, req);
    return ApiResponse.success("Password reset successfully");
  }

  @PostMapping("/reset-password")
  public ApiResponse<String> resetPasswordWithAccessToken(@Valid @RequestBody UserResetPswRequest req, Authentication authentication){
    Long userId = Common.getAuthenticateUserNThrowException(ExceptionEnum.INVALID_ACCESS_TOKEN).getId();
    service.resetPasswordWithAccessToken(userId, req);
    return ApiResponse.success("Password reset successfully");
  }

  @PostMapping("/refresh-token")
  public ResponseEntity<@NonNull ApiResponse<String>> refreshToken(HttpServletRequest request){
    Cookie[] cookies = Optional.ofNullable(request.getCookies()).orElseGet(() -> new Cookie[0]);
    String refreshTokenCookies = Arrays.stream(cookies).filter(cookie -> cookie.getName().equals("refresh_token")).map(
        Cookie::getValue).findFirst().orElse(null);

    UserLoginResponse result = service.refreshToken(refreshTokenCookies);
    HttpHeaders headers = UserServiceUtils.genAccessAndRefreshCookies(result.getAccessToken(), result.getRefreshToken());

    return ResponseEntity.ok()
        .headers(headers)
        .body(ApiResponse.success("Re-generate access and refresh token successfully"));
  }

  @PostMapping("/logout")
  public ResponseEntity<@NonNull ApiResponse<String>> logout(HttpServletRequest request){
    service.logout();
    HttpHeaders headers = UserServiceUtils.clearAccessAndRefreshCookies();
    return ResponseEntity.ok().headers(headers).body(ApiResponse.success("User logout successfully"));
  }
}
