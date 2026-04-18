package com.accounting.accounting.transaction.service.itf;

import com.accounting.accounting.common.service.CrudServiceItf;
import com.accounting.accounting.transaction.dto.*;

public interface TransactionServiceItf extends CrudServiceItf<
        TransactionResponse,
        TransactionSearchRequest,
        TransactionCreateRequest,
        TransactionUpdateRequest,
        TransactionDeleteRequest
        > {
}
