package com.accounting.accounting.common.exception;

import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.response.ApiResponse;
import com.accounting.accounting.user.service.UserServiceUtils;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import tools.jackson.databind.exc.InvalidFormatException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Map<String, String>> handleValidationException(
            MethodArgumentNotValidException ex
    ){
        Map<String, String> fieldErrors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(fieldError -> fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage()));

        return new ApiResponse<>(fieldErrors, 400, false, "VALIDATION_FAILED");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<String> handleInvalidFormat(HttpMessageNotReadableException ex) {

        String message = "Invalid request format";

        if (ex.getCause() instanceof InvalidFormatException ife) {
            if (!ife.getPath().isEmpty()) {
                String field = ife.getPath().getFirst().getPropertyName();
                message = field + " has invalid format";
            }
        }

        return new ApiResponse<>(message, 400, false, "INVALID_FORMAT");
           }

    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<?> handleNoResourceFound(NoResourceFoundException ex){
      return new ApiResponse<>(ex.getMessage(), 500, false, null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<?> handleMethodNotSupport(HttpRequestMethodNotSupportedException ex){
      return new ApiResponse<>(ex.getMessage(), 500, false, null);
    }

    @ExceptionHandler(AuthenticationFailedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<?> handleAuthFailed(AuthenticationFailedException ex) {
        log.error("[AuthenticationFailedException]: {}, {}", ex.getErrorCode(), ex.getMessage());
        return new ApiResponse<>(ex.getMessage(), 401, false, ex.getErrorCode());
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse<?> handleEmailExistsRequest(EmailAlreadyExistsException ex) {
        return new ApiResponse<>(ex.getMessage(), 409, false, ExceptionEnum.EMAIL_EXIST_IN_DB.name());
    }

    @ExceptionHandler(InvalidArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<@NonNull ApiResponse<?>> handleInvalidArgumentException(InvalidArgumentException ex) {
        log.error("[InvalidArgumentException]: {}, {}", ex.getErrorCode(), ex.getMessage());

        return ResponseEntity.ok()
                .headers(ex.getErrorCode().equals(ExceptionEnum.INVALID_REFRESH_TOKEN.name()) ?
                        UserServiceUtils.clearAccessAndRefreshCookies() :
                        null)
                .body(new ApiResponse<>(ex.getMessage(), 400, false, ex.getErrorCode()));
    }

    @ExceptionHandler({
            ObjectOptimisticLockingFailureException.class,
            DataStaleException.class
    })
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse<?> handleOptimisticLockFailure(){
        return new ApiResponse<>(ExceptionEnum.DATA_STALE.getMessage(), 409, false, ExceptionEnum.DATA_STALE.name());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<?> handle(Exception ex) {
        log.error(ex.getMessage(), ex);
        ExceptionEnum exceptionEnum = ExceptionEnum.UNKNOWN_ERROR;
        return new ApiResponse<>(exceptionEnum.getMessage(), 500, false, exceptionEnum.name());
    }
}
