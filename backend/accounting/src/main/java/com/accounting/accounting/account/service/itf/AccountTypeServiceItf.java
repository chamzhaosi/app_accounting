package com.accounting.accounting.account.service.itf;

import com.accounting.accounting.account.dto.acctype.AccountTypeCreateRequest;
import com.accounting.accounting.account.dto.acctype.AccountTypeResponse;
import com.accounting.accounting.account.dto.acctype.AccountTypeUpdateRequest;
import com.accounting.accounting.common.service.CrudTypeService;

public interface AccountTypeServiceItf
        extends CrudTypeService<AccountTypeResponse,
                AccountTypeCreateRequest,
                AccountTypeUpdateRequest> {
}
