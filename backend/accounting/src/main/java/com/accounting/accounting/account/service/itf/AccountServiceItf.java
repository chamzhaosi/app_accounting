package com.accounting.accounting.account.service.itf;

import com.accounting.accounting.account.dto.*;
import com.accounting.accounting.common.service.CrudServiceItf;

public interface AccountServiceItf extends
        CrudServiceItf.FindAll<AccountResponse, AccountSearchRequest>,
        CrudServiceItf.Create<AccountResponse, AccountCreateRequest>,
        CrudServiceItf.Update<AccountResponse, AccountUpdateRequest>,
        CrudServiceItf.Delete<AccountDeleteRequest> {
}
