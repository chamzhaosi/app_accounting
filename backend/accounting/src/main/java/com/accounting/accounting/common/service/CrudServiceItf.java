package com.accounting.accounting.common.service;

import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrudServiceItf {
    interface FindAll<R, S> {
        Page<R> findAll(S request, Pageable pageable);
    }

    interface Create<R, C> {
        R create(C request);
    }

    interface Update<R, U> {
        R update(U request);
    }

    interface Delete<D> {
        void deleteByIds(D request);
    }
}