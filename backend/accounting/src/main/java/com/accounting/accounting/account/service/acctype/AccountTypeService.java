package com.accounting.accounting.account.service.acctype;

import com.accounting.accounting.account.dto.acctype.AccountTypeCreateRequest;
import com.accounting.accounting.account.dto.acctype.AccountTypeResponse;
import com.accounting.accounting.account.dto.acctype.AccountTypeUpdateRequest;
import com.accounting.accounting.account.entity.acctype.AccountType;
import com.accounting.accounting.account.mapper.AccountTypeMapper;
import com.accounting.accounting.account.repository.acctype.AccountTypeRepository;
import com.accounting.accounting.account.service.itf.AccountTypeServiceItf;
import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.common.helper.Common;
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
public class AccountTypeService implements AccountTypeServiceItf {
    private final AccountTypeRepository accountTypeRepository;
    private final AccountTypeMapper accountTypeMapper;

    @Override
    public Page<AccountTypeResponse> findAll(Pageable pageable) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Account Type][Find all] - User ({}) fetch all status of account type including system created", user.getEmail());
        return accountTypeRepository.findAllByUserId(user.getId(), pageable)
                .map(accountTypeMapper::toResponse);
    }

    @Override
    public Page<AccountTypeResponse> findAllActive(Pageable pageable) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Account Type][Find all active type] - User ({}) fetch all active account type including system created", user.getEmail());
        return accountTypeRepository.findActiveUserAndSystemTypes(user.getId(), pageable)
                .map(accountTypeMapper::toResponse);
    }

    @Override
    @Transactional
    public AccountTypeResponse create(AccountTypeCreateRequest request) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Account Type][Find all] - User ({}) create new account type", user.getEmail());

        boolean exist = accountTypeRepository.countByUserIdAndLabel(user.getId(), request.getLabel()) > 0;
        if(exist){
            throw new InvalidArgumentException(ExceptionEnum.DUPLICATE_DATA_FOUND);
        }

        AccountType accountType = new AccountType(user, request.getLabel());
        accountTypeRepository.save(accountType);
        return accountTypeMapper.toResponse(accountType);
    }

    @Override
    @Transactional
    public AccountTypeResponse update(AccountTypeUpdateRequest request) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Account Type][Update] - User ({}) update Account type detail", user.getEmail());
        AccountType accountType = accountTypeRepository.findById(user.getId(), request.getId())
                .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));

        checkTxnTypIsNotCrtBySystem(accountType);
        boolean exist = accountTypeRepository.countByUserIdAndLabel(user.getId(), request.getLabel()) > 0;
        if(exist){
            throw new InvalidArgumentException(ExceptionEnum.DUPLICATE_DATA_FOUND);
        }

        accountType.setLabel(request.getLabel());
        accountType.setIsActive(request.isActive());
        accountTypeRepository.save(accountType);
        return accountTypeMapper.toResponse(accountType);
    }

    @Override
    @Transactional
    public void deleteByIds(List<Long> ids) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info(
                "[Account Type][Delete] - User ({}) delete account type: [{}]",
                user.getEmail(),
                ids.stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(", "))
        );

        List<AccountType> accountTypes =  accountTypeRepository.findByIds(user.getId(), ids);
        if(accountTypes.isEmpty()){
            throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND);
        }

        accountTypes.forEach(accountType -> {
                    checkTxnTypIsNotCrtBySystem(accountType);
                    accountType.setDeletedAt(LocalDateTime.now());
                    accountType.setDeletedBy(user.getEmail());
                }
        );
        accountTypeRepository.saveAll(accountTypes);
    }

    private void checkTxnTypIsNotCrtBySystem(AccountType accountType){
        log.info("[Account Type] - Check whether the account type ({}) created by system", accountType.getId());
        if(accountType.getUser() == null){
            throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_ALLOWED_TO_BE_MODIFIED);
        }
    }
}
