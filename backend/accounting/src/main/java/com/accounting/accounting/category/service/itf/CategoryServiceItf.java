package com.accounting.accounting.category.service.itf;

import com.accounting.accounting.category.dto.*;
import com.accounting.accounting.common.service.CrudServiceItf;

public interface CategoryServiceItf extends
        CrudServiceItf.FindAll<CategoryResponse, CategorySearchRequest>,
        CrudServiceItf.Create<CategoryResponse, CategoryCreateRequest>,
        CrudServiceItf.Update<CategoryResponse, CategoryUpdateRequest>,
        CrudServiceItf.Delete<CategoryDeleteRequest>{
}
