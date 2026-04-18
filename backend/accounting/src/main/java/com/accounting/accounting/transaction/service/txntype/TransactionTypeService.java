package com.accounting.accounting.transaction.service.txntype;

import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeResponse;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeSearchRequest;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.accounting.accounting.transaction.mapper.txntype.TransactionTypeMapper;
import com.accounting.accounting.transaction.repository.txntype.TransactionTypeRepository;
import com.accounting.accounting.user.entity.User;
import lombok.NonNull;
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

    public Page<@NonNull TransactionTypeResponse> findAll (TransactionTypeSearchRequest request, Pageable pageable){
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Transaction Type][Find all] - User ({}) fetch all transaction type including system created with param ({})", user.getEmail(), request.toString());
        return transactionTypeRepository.findAll(user.getId(), request.getIsActive(), pageable)
                .map(transactionTypeMapper::toResponse);
    }

  public TransactionType getTransactionTypeByIds(Long userId, Long typeId){
    return transactionTypeRepository
            .findById(userId, typeId)
            .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.TXN_TYPE_ID_NOT_FOUND_OR_INVALID));
  }
}


