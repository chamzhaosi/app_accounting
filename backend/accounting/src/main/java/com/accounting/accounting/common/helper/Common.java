package com.accounting.accounting.common.helper;

import com.accounting.accounting.common.dto.BaseDto;
import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.exception.AuthenticationFailedException;
import com.accounting.accounting.common.exception.DataStaleException;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.user.entity.CstUserDetails;
import com.accounting.accounting.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
public class Common {
    private static final ZoneId MY_ZONE = ZoneId.of("Asia/Kuala_Lumpur");

    public static LocalDateTime getLocalDateTime(ZoneId zoneId) {
      ZoneId targetZone = (zoneId != null) ? zoneId : MY_ZONE;

      return ZonedDateTime
              .now(targetZone)
              .toLocalDateTime();
    }

    public static LocalDate getCurrentMonthYear(){
        return LocalDate.now(ZoneId.of("Asia/Kuala_Lumpur")).withDayOfMonth(1);
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

    public static void validateVersionMatch(BaseDto requestDto, EntityBase entityBase) {
        log.info("[Common] - Checking data version");
        if (requestDto == null || entityBase == null) {
            throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND);
        }

        if (!Objects.equals(requestDto.getVrs(), entityBase.getVrs())) {
            throw new DataStaleException();
        }
    }

    public static void validateListVersionMatch(List<? extends BaseDto> requestDtos, List<? extends EntityBase> entityBases) {
        if (requestDtos == null || entityBases == null || requestDtos.size() != entityBases.size()) {
            throw new InvalidArgumentException(ExceptionEnum.INVALID_ARGUMENT);
        }

        Map<Long, BaseDto> requestDtoMap = requestDtos.stream()
                .collect(Collectors.toMap(
                        BaseDto::getId,
                        Function.identity(),
                        (a, b) -> {
                            throw new InvalidArgumentException(ExceptionEnum.INVALID_ARGUMENT);
                        }
                ));

        for (EntityBase entity : entityBases) {
            BaseDto requestDto = requestDtoMap.get(entity.getId());
            if (requestDto == null) {
                throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND);
            }
            validateVersionMatch(requestDto, entity);
        }
    }
}
