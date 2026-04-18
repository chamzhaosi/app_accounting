package com.accounting.accounting.category.service.itf;

import com.accounting.accounting.category.dto.*;
import com.accounting.accounting.common.service.CrudServiceItf;

public interface CategoryServiceItfItf extends CrudServiceItf<
        CategoryResponse,
        CategorySearchRequest,
        CategoryCreateRequest,
        CategoryUpdateRequest,
        CategoryDeleteRequest
        > {
}
