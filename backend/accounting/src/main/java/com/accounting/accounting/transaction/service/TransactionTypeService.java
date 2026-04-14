package com.accounting.accounting.transaction.service;

import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.exception.BadRequestException;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.common.exception.ResourceNotFoundException;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.transaction.dto.TransactionTypeRequest;
import com.accounting.accounting.transaction.entity.TransactionType;
import com.accounting.accounting.transaction.repository.TransactionTypeRepository;
import com.accounting.accounting.user.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionTypeService {
    private final TransactionTypeRepository transactionTypeRepository;

    @Transactional
    public TransactionType create(TransactionTypeRequest req){
        User user = Common.getAuthenticateUser(null);
        log.info("[Transaction Type][Find all] - User ({}) create new txn typ", user.getEmail());

        boolean exist = transactionTypeRepository.existsLabel(user.getId(), req.getLabel());
        if(exist){
            throw new InvalidArgumentException(ExceptionEnum.DUPLICATE_DATA_FOUND);
        }

        TransactionType transactionType = new TransactionType(user, req.getLabel());
        return transactionTypeRepository.save(transactionType);
    }

    public List<TransactionType> findAll() {
        User user = Common.getAuthenticateUser(null);
        log.info("[Transaction Type][Find all] - User ({}) fetch all txn type including system created", user.getEmail());
        return transactionTypeRepository.findActiveUserAndSystemTypes(user.getId()).orElseGet(List::of);
    }

    public List<TransactionType> findByActiveTrue (){
        return transactionTypeRepository.findByIsActiveTrue();
    }

    public TransactionType findById (Long typeId){
        return transactionTypeRepository.findById(typeId).orElseThrow(() -> notFoundTxnTypeById(typeId));
    }


    private ResourceNotFoundException notFoundTxnTypeById(Long typeId){
        return  new ResourceNotFoundException("Transaction type not found with id: " + typeId);
    }

}


