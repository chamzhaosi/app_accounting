package com.accounting.accounting.common.response;

import java.time.Instant;

public class ApiResponse<T> {
    private T data;
    private int code;
    private boolean success;
    private String message;
    private Instant timestamp;

    public ApiResponse(T data, int code, boolean success, String message){
        this.data = data;
        this.code = code;
        this.success = success;
        this.message = message;
        this.timestamp = Instant.now();
    }


    public static <T> ApiResponse<T> success(T data){
        return new ApiResponse<>(data,  200, true, null);
    }

    public static <T> ApiResponse<T> success(T data, String message){
        return new ApiResponse<>(data, 200,true, message);
    }

    public static <T> ApiResponse<T> fail(T data, int code, String message){
        return new ApiResponse<>(data,code, false, message);
    }

    public T getData() { return data; }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Instant getTimestamp() { return timestamp; }
    public int getCode() { return code; }
}
