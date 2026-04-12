package com.accounting.accounting.common.response;

import java.time.Instant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class ApiResponse<T> {
    private final T data;
    private final int code;
    private final boolean success;
    private final String message;
    private final Instant timestamp = Instant.now();

    public static <T> ApiResponse<T> success(T data){
        return new ApiResponse<>(data,  200, true, null);
    }

    public static <T> ApiResponse<T> success(T data, String message){
        return new ApiResponse<>(data, 200,true, message);
    }

    public static <T> ApiResponse<T> fail(T data, int code, String message){
        return new ApiResponse<>(data,code, false, message);
    }
}
