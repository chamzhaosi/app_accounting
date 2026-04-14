package com.accounting.accounting.auth.service;

import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.response.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import javax.naming.AuthenticationException;
import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public void commence(HttpServletRequest request, HttpServletResponse response, org.springframework.security.core.AuthenticationException authException) throws IOException, ServletException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType("application/json;charset=UTF-8");

    ApiResponse<?> apiResponse = new ApiResponse<String>(
            ExceptionEnum.INVALID_AUTHENTICATION.getMessage(),
            401,
            false,
            ExceptionEnum.INVALID_AUTHENTICATION.name()
    );

    response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
  }
}