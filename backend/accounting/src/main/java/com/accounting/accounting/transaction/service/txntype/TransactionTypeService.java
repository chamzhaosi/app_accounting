package com.accounting.accounting.transaction.service.txntype;

import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeResponse;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeSearchRequest;
import com.accounting.accounting.transaction.mapper.TransactionTypeMapper;
import com.accounting.accounting.transaction.repository.txntype.TransactionTypeRepository;
import com.accounting.accounting.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionTypeService {
    private final TransactionTypeRepository transactionTypeRepository;
    private final TransactionTypeMapper transactionTypeMapper;

    public Page<TransactionTypeResponse> findAll (TransactionTypeSearchRequest request, Pageable pageable){
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Transaction Type][Find all] - User ({}) fetch all transaction type including system created with param ({})", user.getEmail(), request.toString());
        return transactionTypeRepository.findAll(user.getId(), request.getIsActive(), pageable)
                .map(transactionTypeMapper::toResponse);
    }
}


