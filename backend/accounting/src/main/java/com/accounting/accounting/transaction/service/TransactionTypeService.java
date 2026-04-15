package com.accounting.accounting.transaction.service;

import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.transaction.dto.TransactionTypeCreateRequest;
import com.accounting.accounting.transaction.dto.TransactionTypeResponse;
import com.accounting.accounting.transaction.dto.TransactionTypeUpdateRequest;
import com.accounting.accounting.transaction.entity.TransactionType;
import com.accounting.accounting.transaction.mapper.TransactionTypeMapper;
import com.accounting.accounting.transaction.repository.TransactionTypeRepository;
import com.accounting.accounting.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionTypeService {
    private final TransactionTypeRepository transactionTypeRepository;
    private final TransactionTypeMapper transactionTypeMapper;

    @Transactional
    public TransactionTypeResponse create(TransactionTypeCreateRequest req){
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Transaction Type][Find all] - User ({}) create new transaction type", user.getEmail());

        boolean exist = transactionTypeRepository.existsLabel(user.getId(), req.getLabel());
        if(exist){
            throw new InvalidArgumentException(ExceptionEnum.DUPLICATE_DATA_FOUND);
        }

        TransactionType transactionType = new TransactionType(user, req.getLabel());
        transactionTypeRepository.save(transactionType);
        return transactionTypeMapper.toResponse(transactionType);
    }

    // This api is for dropdown options use
    public List<TransactionTypeResponse> findAllActive() {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Transaction Type][Find all active type] - User ({}) fetch all active transaction type including system created", user.getEmail());
        List<TransactionType> transactionTypes = transactionTypeRepository.findActiveUserAndSystemTypes(user.getId()).orElseGet(List::of);
        return transactionTypeMapper.toResponseList(transactionTypes);
    }

    // This api is to list all system and user created
    public List<TransactionTypeResponse> findAll (){
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Transaction Type][Find all] - User ({}) fetch all status of transaction type including system created", user.getEmail());
        List<TransactionType> transactionTypes = transactionTypeRepository.findAllByUserId(user.getId()).orElseGet(List::of);
        return transactionTypeMapper.toResponseList(transactionTypes);
    }

    @Transactional
    public TransactionTypeResponse updateTxnType (TransactionTypeUpdateRequest req){
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Transaction Type][Update] - User ({}) update transaction type detail", user.getEmail());
        TransactionType transactionType = transactionTypeRepository.findById(req.getId())
                .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));
        checkTxnTypeValidation(transactionType, user.getId());
        transactionType.setLabel(req.getLabel());
        transactionType.setIsActive(req.isActive());
        transactionTypeRepository.save(transactionType);

        return transactionTypeMapper.toResponse(transactionType);
    }

    @Transactional
    public void deleteTxnTypeByIds (List<Long> typeIds){
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info(
                "[Transaction Type][Delete] - User ({}) delete txn type: [{}]",
                user.getEmail(),
                typeIds.stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(", "))
        );

        List<TransactionType> transactionTypes =  transactionTypeRepository.findByIds(typeIds)
                .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));

        transactionTypes.forEach(transactionType -> {
            checkTxnTypeValidation(transactionType, user.getId());
            transactionType.setIsDelete(true);
        });
        transactionTypeRepository.saveAll(transactionTypes);
    }

    private void checkTxnTypeValidation(TransactionType transactionType, Long userId){
        log.info("[Transaction Type] - Check transaction type {} which isn't create by system", transactionType.getId());
        // if created by system
        if(transactionType.getUser() == null){
            throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_ALLOWED_TO_BE_MODIFIED);
        }

        // if user id not matched with login user
        if (!transactionType.getUser().getId().equals(userId)){
            throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND);
        }
    }
}


