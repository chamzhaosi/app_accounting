package com.accounting.accounting.common.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CrudTypeService<R, S, C, U> {
    public Page<R> findAll(S request, Pageable pageable);
    public R create(C request);
    public R update(U request);
    public void deleteByIds(List<Long> ids);
}
