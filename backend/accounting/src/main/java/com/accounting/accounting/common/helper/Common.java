package com.accounting.accounting.common.helper;

import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.exception.AuthenticationFailedException;
import com.accounting.accounting.user.entity.CstUserDetails;
import com.accounting.accounting.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;

@Slf4j
public class Common {
    private static final ZoneId MY_ZONE = ZoneId.of("Asia/Kuala_Lumpur");

    public static LocalDateTime getLocalDateTime(ZoneId zoneId) {
      ZoneId targetZone = (zoneId != null) ? zoneId : MY_ZONE;

      return ZonedDateTime
              .now(targetZone)
              .toLocalDateTime();
    }

    public static User getAuthenticateUserNThrowException(@Nullable ExceptionEnum exceptionEnum) {
        final ExceptionEnum DEFAULT_ERROR = ExceptionEnum.INVALID_AUTHENTICATION;
        ExceptionEnum errorEnum = exceptionEnum == null ? DEFAULT_ERROR : exceptionEnum;
        return getAuthenticateUserInfo().orElseThrow(() -> new AuthenticationFailedException(errorEnum));
    }

    public static Optional<User> getAuthenticateUserInfo() {
        log.info("[Common] - Get authenticate user info");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CstUserDetails userDetails) {
            return Optional.ofNullable(userDetails.getUser());
        }

        return Optional.empty();
    }
}
