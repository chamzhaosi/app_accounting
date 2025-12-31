package com.accounting.accounting.common.helper;

import com.accounting.accounting.category.dto.CategoryResponse;
import com.accounting.accounting.common.response.ApiResponsePagination;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

public class Common {
    public static Pageable genPageable(int page, int size, String sort) {
         List<Sort.Order> orders = new ArrayList<>();

        if (sort != null && !sort.isBlank()) {
            String[] sorts = sort.split(";");
            for (String s : sorts) {
                String[] p = s.split(",");
                orders.add(new Sort.Order(
                        Sort.Direction.fromString(p[1]),
                        p[0]
                ));
            }
        } else {
            orders.add(new Sort.Order(Sort.Direction.DESC, "id"));
        }

        return PageRequest.of(page - 1, size,Sort.by(orders));
    }

    public static <T, R> ApiResponsePagination<R> toApiResponsePage(
            Page<@NonNull T> page,
            Function<T, R> mapper
    ) {
        List<R> list = page.getContent()
                .stream()
                .map(mapper)
                .toList();

        return ApiResponsePagination.success(
                list,
                page.getTotalPages(),
                page.getNumber() + 1,
                page.getSize()
        );
    }
}
