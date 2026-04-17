package com.accounting.accounting.category.service.itf;

import com.accounting.accounting.category.dto.CategoryCreateRequest;
import com.accounting.accounting.category.dto.CategoryResponse;
import com.accounting.accounting.category.dto.CategorySearchRequest;
import com.accounting.accounting.category.dto.CategoryUpdateRequest;
import com.accounting.accounting.common.service.CrudTypeService;

public interface CategoryServiceItf extends CrudTypeService<
        CategoryResponse,
        CategorySearchRequest,
        CategoryCreateRequest,
        CategoryUpdateRequest> {
}
