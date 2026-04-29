package com.accounting.accounting.account.service.itf;

import com.accounting.accounting.account.dto.acctype.*;
import com.accounting.accounting.common.service.CrudServiceItf;

public interface AccountTypeServiceItf extends
        CrudServiceItf.FindAll<AccountTypeResponse, AccountTypeSearchRequest>,
        CrudServiceItf.Create<AccountTypeResponse, AccountTypeCreateRequest>,
        CrudServiceItf.Update<AccountTypeResponse, AccountTypeUpdateRequest>,
        CrudServiceItf.Delete<AccountTypeDeleteRequest> {
}
