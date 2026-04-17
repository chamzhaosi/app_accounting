package com.accounting.accounting.transaction.service.itf;

import com.accounting.accounting.common.service.CrudTypeService;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeCreateRequest;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeResponse;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeUpdateRequest;

public interface TransactionTypeServiceItf
        extends CrudTypeService<TransactionTypeResponse,
                TransactionTypeCreateRequest,
                TransactionTypeUpdateRequest> {
}
