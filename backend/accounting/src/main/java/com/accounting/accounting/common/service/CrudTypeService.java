package com.accounting.accounting.common.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CrudTypeService<R, C, U> {
    public Page<R> findAll(Pageable pageable);
    public Page<R> findAllActive(Pageable pageable);
    public R create(C request);
    public R update(U request);
    public void deleteByIds(List<Long> ids);
}
