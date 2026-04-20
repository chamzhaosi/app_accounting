package com.accounting.accounting.account.service;

import com.accounting.accounting.account.dto.*;
import com.accounting.accounting.account.entity.Account;
import com.accounting.accounting.account.entity.acctype.AccountType;
import com.accounting.accounting.account.mapper.AccountMapper;
import com.accounting.accounting.account.repository.AccountRepository;
import com.accounting.accounting.account.repository.acctype.AccountTypeRepository;
import com.accounting.accounting.account.service.acctype.AccountTypeService;
import com.accounting.accounting.account.service.itf.AccountServiceItf;
import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.enums.TransactionNatureEnum;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.transaction.entity.Transaction;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.accounting.accounting.transaction.repository.TransactionRepository;
import com.accounting.accounting.transaction.repository.txntype.TransactionTypeRepository;
import com.accounting.accounting.transaction.service.TransactionService;
import com.accounting.accounting.user.entity.User;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountService implements AccountServiceItf {
  private final AccountRepository accountRepository;
  private final AccountTypeService accountTypeService;
  private final TransactionRepository transactionRepository;
  private final TransactionTypeRepository transactionTypeRepository;
  private final AccountMapper accountMapper;

  @Override
  public Page<@NonNull AccountResponse> findAll(AccountSearchRequest request, Pageable pageable) {
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Account][Find All]  - User ({}) fetch all account with params ({})", user.getEmail(), request.toString());
    return accountRepository.search(user.getId(),
                    request.getLabel(),
                    request.getAccTypeId(),
                    request.getIsActive(),
                    pageable)
            .map(accountMapper::toResponse);
  }

  @Override
  @Transactional
  public AccountResponse create(AccountCreateRequest request) {
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Account][Create] - User ({}) create new account", user.getEmail());

    boolean exist = accountRepository.countBySameData(user.getId(), null, request.getAccTypeId(), request.getLabel()) > 0;
    if(exist){
      throw new InvalidArgumentException(ExceptionEnum.DUPLICATE_DATA_FOUND);
    }

    AccountType accountType = accountTypeService.getAccountTypeByIds(user.getId(), request.getAccTypeId());
    Account account = new Account(user, accountType, request);
    return accountMapper.toResponse(accountRepository.save(account));
  }

  @Override
  @Transactional
  public AccountResponse update(AccountUpdateRequest request) {
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Account][Update] - User ({}) update account by id ({})", user.getEmail(), request.getId());

    Account account = accountRepository.findById(user.getId(), request.getId())
            .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));

    boolean exist = accountRepository.countBySameData(user.getId(), account.getId(), request.getAccTypeId(), request.getLabel()) > 0;
    if(exist){
      throw new InvalidArgumentException(ExceptionEnum.DUPLICATE_DATA_FOUND);
    }
    setAdjustedTxn(user, account, request.getAmount());

    account.setLabel(request.getLabel());
    account.setDescription(request.getDescription());
    account.setIsActive(request.isActive());
    account.setIsMainAccount(request.getIsMainAccount());
    account.setCurrentBalance(request.getAmount());

    if(account.getOpeningBalance() == null || account.getOpeningBalance().equals(BigDecimal.valueOf(0.00))){
      account.setOpeningBalance(request.getAmount());
    }

    accountRepository.save(account);
    return accountMapper.toResponse(account);
  }

  @Override
  @Transactional
  public void deleteByIds(AccountDeleteRequest request) {
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info(
            "[Account][Delete] - User ({}) delete account : [{}]",
            user.getEmail(),
            request.getIds().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(", "))
    );

    List<Account> accounts = accountRepository.findByIds(user.getId(), request.getIds());
    if(accounts.isEmpty()){
      throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND);
    }

    accounts.forEach(c -> {
      c.setDeletedAt(LocalDateTime.now());
      c.setDeletedBy(user.getEmail());
    });
    accountRepository.saveAll(accounts);
  }

  public Account getAccountById(Long userId, Long accId){
    return accountRepository.findById(userId, accId)
            .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.ACC_ID_NOT_FOUND_OR_INVALID));
  }

  public void resetCurrentBalance(Account account, Transaction oldTransaction) {
    log.info("[Account] - Reset current balance by reversing old transaction amount");

    BigDecimal currentBalance = account.getCurrentBalance() != null
            ? account.getCurrentBalance()
            : BigDecimal.ZERO;
    BigDecimal amount = oldTransaction.getAmount();
    String txnNature = oldTransaction.getTransactionType() != null
            ? oldTransaction.getTransactionType().getNature()
            : null;

    if (TransactionNatureEnum.INC.getCode().equals(txnNature)) {
      account.setCurrentBalance(currentBalance.subtract(amount));
    } else if (TransactionNatureEnum.EXP.getCode().equals(txnNature)) {
      account.setCurrentBalance(currentBalance.add(amount));
    } else {
      account.setCurrentBalance(currentBalance.subtract(amount));
    }

    accountRepository.save(account);
  }

  public void updateCurrentBalance(Account account, Transaction transaction){
    log.info("[Account] - Calculate current balance by transaction amount");
    BigDecimal currentBalance = account.getCurrentBalance() != null
            ? account.getCurrentBalance()
            : BigDecimal.ZERO;
    BigDecimal amount = transaction.getAmount();
    String txnNature = transaction.getTransactionType() != null
            ? transaction.getTransactionType().getNature()
            : null;

    if (TransactionNatureEnum.INC.getCode().equals(txnNature)) {
      account.setCurrentBalance(currentBalance.add(amount));
    } else if (TransactionNatureEnum.EXP.getCode().equals(txnNature)) {
      account.setCurrentBalance(currentBalance.subtract(amount));
    } else {
      account.setCurrentBalance(currentBalance.add(amount));
    }

  }

  private void setAdjustedTxn(User user, Account account, BigDecimal updatedAmount){
    boolean hasTxnBfr = transactionRepository.countTransactionByAccId(user.getId(), account.getId()) > 0;
    if(hasTxnBfr){
      log.info("[Account] - Manually add an extra adjusted txn");
      TransactionType transactionType = transactionTypeRepository.findByLabel("Adjust")
              .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.TXN_TYPE_ID_NOT_FOUND_OR_INVALID));

      BigDecimal diff = account.getCurrentBalance().subtract(updatedAmount);
      Transaction adjustedTransaction = new Transaction(user, transactionType, null, account,
              "Balance adjustment", diff, LocalDate.now(ZoneId.of("Asia/Kuala_Lumpur")),
              null);
      transactionRepository.save(adjustedTransaction);
    }
  }
}
