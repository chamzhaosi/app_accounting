package com.accounting.accounting.auth.service;

import com.accounting.accounting.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

  private final SecretKey key;
  private final long expirationMs;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-ms}") long expirationMs
  ) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMs = expirationMs;
  }

  public String generateToken(User user) {
    Instant now = Instant.now();

    return Jwts.builder()
        .subject(user.getEmail())
        .claim("userId", user.getId())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusMillis(expirationMs)))
        .signWith(key)
        .compact();
  }

  public Claims extractAllClaims(String token) {
    return Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  public String extractEmail(String token) {
    return extractAllClaims(token).getSubject();
  }

  public Long extractUserId(String token) {
    Claims claims = extractAllClaims(token);
    Object userId = claims.get("userId");

    if (userId instanceof Integer) {
      return ((Integer) userId).longValue();
    }
    if (userId instanceof Long) {
      return (Long) userId;
    }

    throw new RuntimeException("Invalid userId type");
  }

  public boolean isTokenValid(String token) {
    try {
      extractAllClaims(token); // will throw if invalid / expired / bad signature
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public String extractCookieValue(HttpServletRequest request, String cookieName) {
    Cookie[] cookies = request.getCookies();

    if (cookies == null) {
      return null;
    }

    return Arrays.stream(cookies)
        .filter(cookie -> cookieName.equals(cookie.getName()))
        .map(Cookie::getValue)
        .findFirst()
        .orElse(null);
  }
}