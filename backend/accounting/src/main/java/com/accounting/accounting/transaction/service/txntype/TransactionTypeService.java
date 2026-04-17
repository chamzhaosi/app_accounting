package com.accounting.accounting.transaction.service.txntype;

import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeCreateRequest;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeResponse;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeUpdateRequest;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.accounting.accounting.transaction.mapper.TransactionTypeMapper;
import com.accounting.accounting.transaction.repository.txntype.TransactionTypeRepository;
import com.accounting.accounting.transaction.service.itf.TransactionTypeServiceItf;
import com.accounting.accounting.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionTypeService implements TransactionTypeServiceItf {
    private final TransactionTypeRepository transactionTypeRepository;
    private final TransactionTypeMapper transactionTypeMapper;

    @Transactional
    public TransactionTypeResponse create(TransactionTypeCreateRequest req){
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Transaction Type][Find all] - User ({}) create new transaction type", user.getEmail());

        boolean exist = transactionTypeRepository.countByUserIdAndLabel(user.getId(), req.getLabel()) > 0;
        if(exist){
            throw new InvalidArgumentException(ExceptionEnum.DUPLICATE_DATA_FOUND);
        }

        TransactionType transactionType = new TransactionType(user, req.getLabel());
        transactionTypeRepository.save(transactionType);
        return transactionTypeMapper.toResponse(transactionType);
    }

    // This api is to list all system and user created
    public Page<TransactionTypeResponse> findAll (Pageable pageable){
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Transaction Type][Find all] - User ({}) fetch all status of transaction type including system created", user.getEmail());
        return transactionTypeRepository.findAllByUserId(user.getId(), pageable)
                .map(transactionTypeMapper::toResponse);
    }

    // This api is for dropdown options use
    public Page<TransactionTypeResponse> findAllActive(Pageable pageable) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Transaction Type][Find all active type] - User ({}) fetch all active transaction type including system created", user.getEmail());
        return transactionTypeRepository.findActiveUserAndSystemTypes(user.getId(), pageable)
                .map(transactionTypeMapper::toResponse);
    }

    @Transactional
    public TransactionTypeResponse update (TransactionTypeUpdateRequest req){
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Transaction Type][Update] - User ({}) update transaction type detail", user.getEmail());
        TransactionType transactionType = transactionTypeRepository.findById(user.getId(), req.getId())
                .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));

        checkTxnTypIsNotCrtBySystem(transactionType);
        boolean exist = transactionTypeRepository.countByUserIdAndLabel(user.getId(), req.getLabel()) > 0;
        if(exist){
            throw new InvalidArgumentException(ExceptionEnum.DUPLICATE_DATA_FOUND);
        }

        transactionType.setLabel(req.getLabel());
        transactionType.setIsActive(req.isActive());
        transactionTypeRepository.save(transactionType);

        return transactionTypeMapper.toResponse(transactionType);
    }

    @Transactional
    public void deleteByIds (List<Long> typeIds){
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info(
                "[Transaction Type][Delete] - User ({}) delete txn type: [{}]",
                user.getEmail(),
                typeIds.stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(", "))
        );

        List<TransactionType> transactionTypes =  transactionTypeRepository.findByIds(user.getId(), typeIds);
        if(transactionTypes.isEmpty()){
            throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND);
        }

        transactionTypes.forEach(transactionType -> {
            checkTxnTypIsNotCrtBySystem(transactionType);
            transactionType.setDeletedAt(LocalDateTime.now());
            transactionType.setDeletedBy(user.getEmail());
        }
        );
        transactionTypeRepository.saveAll(transactionTypes);
    }

    private void checkTxnTypIsNotCrtBySystem(TransactionType transactionType){
        log.info("[Transaction Type] - Check whether the txn type ({}) created by system", transactionType.getId());
        if(transactionType.getUser() == null){
            throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_ALLOWED_TO_BE_MODIFIED);
        }
    }
}


