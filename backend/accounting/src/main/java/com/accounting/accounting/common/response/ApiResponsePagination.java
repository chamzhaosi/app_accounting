package com.accounting.accounting.common.response;

import org.jspecify.annotations.Nullable;

import java.time.Instant;
import java.util.List;

public class ApiResponsePagination<T> {
    private List<T> data;
    private int code;
    private boolean success;
    private String message;

    @Nullable
    private Integer totalPage;

    @Nullable
    private Integer page;

    @Nullable
    private Integer size;
    private Instant timestamp;

    public ApiResponsePagination(List<T> data, int code, boolean success, String message, @Nullable Integer totalPage, @Nullable Integer page, @Nullable Integer size){
        this.data = data;
        this.code = code;
        this.success = success;
        this.message = message;
        this.totalPage = totalPage;
        this.page = page;
        this.size = size;
        this.timestamp = Instant.now();
    }

    public static <T> ApiResponsePagination<T> success(List<T> data, @Nullable Integer totalPage, @Nullable Integer page, @Nullable Integer size){
        return new ApiResponsePagination<>(data, 200,true, null, totalPage, page, size);
    }

    public static <T> ApiResponsePagination<T> success(List<T> data, @Nullable String message, @Nullable Integer totalPage, @Nullable Integer page, @Nullable Integer size){
        return new ApiResponsePagination<>(data, 200,true, message, totalPage, page, size);
    }

    public static <T> ApiResponsePagination<T> fail(List<T> data, int code, String message, @Nullable Integer totalPage, @Nullable Integer page, @Nullable Integer size){
        return new ApiResponsePagination<>(data,code, false, message, totalPage, page, size);
    }

    public List<T> getData() { return data; }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Instant getTimestamp() { return timestamp; }
    public int getCode() { return code; }

    public @Nullable Integer getPage() {
        return page;
    }

    public @Nullable Integer getTotalPage() {
        return totalPage;
    }

    public @Nullable Integer getSize() {
        return size;
    }
}
