package com.accounting.accounting.user.controller;

import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.user.dto.UserCreateRequest;
import com.accounting.accounting.user.dto.UserLoginRequest;
import com.accounting.accounting.user.dto.UserLoginResponse;
import com.accounting.accounting.user.dto.UserResetPswRequest;
import com.accounting.accounting.user.entity.CstUserDetails;
import com.accounting.accounting.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Arrays;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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

    HttpHeaders headers = genAccessAndRefreshCookies(result.getAccessToken(), result.getRefreshToken());
    return ResponseEntity.ok()
        .headers(headers)
        .body(ApiResponse.success("User login successfully"));
  }

  @PostMapping("/reset-password/{token}")
  public ApiResponse<String> resetPassword(@Valid @PathVariable String token, @RequestBody UserResetPswRequest req){
    service.resetPassword(token, req);
    return ApiResponse.success("Password reset successfully");
  }

  @PostMapping("/refresh-token")
  public ResponseEntity<@NonNull ApiResponse<String>> refreshToken(HttpServletRequest request){
    String refreshTokenCookies = Arrays.stream(request.getCookies()).filter(cookie -> cookie.getName().equals("refresh_token")).map(
        Cookie::getValue).findFirst().orElse(null);

    UserLoginResponse result = service.refreshToken(refreshTokenCookies);
    HttpHeaders headers = genAccessAndRefreshCookies(result.getAccessToken(), result.getRefreshToken());

    return ResponseEntity.ok()
        .headers(headers)
        .body(ApiResponse.success("refresh-token successfully"));
  }

  @PostMapping("/logout")
  public ResponseEntity<@NonNull ApiResponse<String>> logout(HttpServletRequest request, Authentication authentication){
    if(authentication != null && authentication.getPrincipal() != null){
      if(authentication.getPrincipal() instanceof CstUserDetails userDetails) {
        service.logout(userDetails.getUserId());
      }
    }

    HttpHeaders headers = clearAccessAndRefreshCookies();
    return ResponseEntity.ok().headers(headers).body(ApiResponse.success("User logout successfully"));
  }

  private HttpHeaders genAccessAndRefreshCookies(String accessToken, String refreshToken){
    ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
        .httpOnly(true)     // JS cannot read
        .secure(true)       // HTTPS only
        .path("/")          // available for all endpoints
        .maxAge(3600)       // 1 hour
        .sameSite("Strict") // CSRF protection
        .build();

    ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
        .httpOnly(true)     // JS cannot read
        .secure(true)       // HTTPS only
        .path("/api/users/refresh-token")          // available for refresh-path
        .maxAge(3600 * 24 * 7)   // 7 days
        .sameSite("Strict") // CSRF protection
        .build();

    HttpHeaders headers = new HttpHeaders();
    headers.add(HttpHeaders.SET_COOKIE, accessCookie.toString());
    headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

    return headers;
  }

  private HttpHeaders clearAccessAndRefreshCookies(){
    ResponseCookie accessCookie = ResponseCookie.from("access_token", "")
        .httpOnly(true)     // JS cannot read
        .secure(true)       // HTTPS only
        .path("/")          // available for all endpoints
        .maxAge(0)       // 1 hour
        .build();

    ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", "")
        .httpOnly(true)     // JS cannot read
        .secure(true)       // HTTPS only
        .path("/")          // available for refresh-path
        .maxAge(0)   // 7 days
        .build();

    HttpHeaders headers = new HttpHeaders();
    headers.add(HttpHeaders.SET_COOKIE, accessCookie.toString());
    headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

    return headers;
  }
}
