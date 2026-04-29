package com.accounting.accounting.transaction.service.itf;

import com.accounting.accounting.common.service.CrudServiceItf;
import com.accounting.accounting.transaction.dto.transaction.*;

public interface TransactionServiceItf extends
        CrudServiceItf.FindAll<TransactionResponse, TransactionSearchRequest>,
        CrudServiceItf.Create<TransactionResponse, TransactionCreateRequest>,
        CrudServiceItf.Update<TransactionResponse, TransactionUpdateRequest>,
        CrudServiceItf.Delete<TransactionDeleteRequest> {
}
