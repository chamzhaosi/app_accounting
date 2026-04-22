package com.accounting.accounting.account.service.acctype;

import com.accounting.accounting.account.dto.acctype.*;
import com.accounting.accounting.account.entity.acctype.AccountType;
import com.accounting.accounting.account.mapper.acctype.AccountTypeMapper;
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
    public Page<AccountTypeResponse> findAll(AccountTypeSearchRequest request, Pageable pageable) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Account Type][Find all] - User ({}) fetch all account type including system created with params ({})", user.getEmail(), request.toString());
        return accountTypeRepository.search(user.getId(), request.getIsActive(), pageable)
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
        Common.validateVersionMatch(request, accountType);

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
    public void deleteByIds(AccountTypeDeleteRequest request) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info(
                "[Account Type][Delete] - User ({}) delete account type: [{}]",
                user.getEmail(),
                request.getIds().stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(", "))
        );

        List<AccountType> accountTypes =  accountTypeRepository.findByIds(user.getId(), request.getIds());
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

    public AccountType getAccountTypeByIds(Long userId, Long typeId){
      return accountTypeRepository
              .findById(userId, typeId)
              .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.ACC_TYPE_ID_NOT_FOUND_OR_INVALID));
    }

    private void checkTxnTypIsNotCrtBySystem(AccountType accountType){
      log.info("[Account Type] - Check whether the account type ({}) created by system", accountType.getId());
      if(accountType.getUser() == null){
        throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_ALLOWED_TO_BE_MODIFIED);
      }
    }
}
