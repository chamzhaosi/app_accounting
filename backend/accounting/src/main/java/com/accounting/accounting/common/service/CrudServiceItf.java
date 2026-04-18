package com.accounting.accounting.common.service;

import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrudServiceItf<R, S, C, U ,D> {
    public Page<@NonNull R> findAll(S request, Pageable pageable);
    public R create(C request);
    public R update(U request);
    public void deleteByIds(D request);
}
