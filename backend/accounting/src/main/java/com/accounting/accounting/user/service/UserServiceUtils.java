package com.accounting.accounting.user.service;

import com.accounting.accounting.common.enums.UserForgetPwsStatusEnum;
import com.accounting.accounting.common.enums.UserRefreshTokenStatusEnum;
import com.accounting.accounting.user.entity.*;
import com.accounting.accounting.user.repository.UserForgetPswRepository;
import com.accounting.accounting.user.repository.UserLgnRepository;
import com.accounting.accounting.user.repository.UserRefreshTokenRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Slf4j
@Component
@AllArgsConstructor
public class UserServiceUtils {
    private final UserLgnRepository userLgnRepository;
    private final UserForgetPswRepository userForgetPswRepository;
    private final UserRefreshTokenRepository userRefreshTokenRepository;

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void updateUserWrongPasswordCount(User user) {
        log.info("[UserService] - Update user wrong password failed count");
        UserLgn userLgn = userLgnRepository.findTopByUserId(user.getId())
                .orElse(new UserLgn(user, 0L, user.getEmail()));
        userLgn.setFailedCount(userLgn.getFailedCount() + 1);
        userLgnRepository.save(userLgn);
    }

    public void resetUserWrongPasswordCount(User user){
        log.info("[UserService] - Reset user wrong password failed count");
        userLgnRepository.findTopByUserId(user.getId()).ifPresent(u -> {
            u.setFailedCount(0L);
            userLgnRepository.save(u);
        } );
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void updateResetTokenExpired(UserForgetPsw userForgetPsw){
        userForgetPsw.setStatus(UserForgetPwsStatusEnum.EXPIRED.getCode());
        userForgetPswRepository.save(userForgetPsw);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void updateResetTokenExpired(UserRefreshToken userRefreshToken){
        userRefreshToken.setStatus(UserRefreshTokenStatusEnum.EXPIRED.getCode());
        userRefreshTokenRepository.save(userRefreshToken);
    }

    public static HttpHeaders genAccessAndRefreshCookies(String accessToken, String refreshToken){
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)     // JS cannot read
                .secure(true)       // HTTPS only
                .path("/")          // available for all endpoints
                .maxAge(Duration.ofMinutes(15))       // 1 hour
                .sameSite("Strict") // CSRF protection
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)     // JS cannot read
                .secure(true)       // HTTPS only
                .path("/api/users/refresh-token")          // available for refresh-path
                .maxAge(Duration.ofDays(7))   // 7 days
                .sameSite("Strict") // CSRF protection
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, accessCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return headers;
    }

    public static HttpHeaders clearAccessAndRefreshCookies(){
        ResponseCookie accessCookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)     // JS cannot read
                .secure(true)       // HTTPS only
                .path("/")          // available for all endpoints
                .maxAge(0)       // 1 hour
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)     // JS cannot read
                .secure(true)       // HTTPS only
                .path("/api/users/refresh-token")     // available for refresh-path
                .maxAge(0)   // 7 days
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, accessCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return headers;
    }
}
