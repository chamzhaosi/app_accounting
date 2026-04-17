package com.accounting.accounting.common.response;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class ApiResponsePagination<T> {
    private List<T> data;
    private int code;
    private boolean success;
    private String message;
    private Integer pageSize;
    private Long total;
    private Integer totalPage;
    private Integer page;
    private Instant timestamp;

    public ApiResponsePagination(Page<T> data, int code, boolean success, String message){
        this.data = data.getContent();
        this.code = code;
        this.success = success;
        this.message = message;
        this.pageSize = data.getSize();
        this.total = data.getTotalElements();
        this.totalPage = data.getTotalPages();
        this.page = data.getNumber() + 1;
        this.timestamp = Instant.now();
    }

    public static <T> ApiResponsePagination<T> success(Page<T> data){
        return new ApiResponsePagination<>(data, 200,true, null);
    }

    public static <T> ApiResponsePagination<T> success(Page<T> data, String message){
        return new ApiResponsePagination<>(data, 200,true, message);
    }

    public static <T> ApiResponsePagination<T> fail(Page<T> data, int code, String message){
        return new ApiResponsePagination<>(data, code, false, message);
    }
}
