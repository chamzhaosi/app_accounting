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
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Array;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
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
    createAdjustedTxn(user, account, request.getAmount());

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

  public List<Account> getAccountByIds(Long userId, List<Long> accIds){
    return accountRepository.findByIds(userId, accIds);
  }

  public void resetCurrentBalance(Transaction oldTransaction) {
    log.info("[Account] - Reset current balance by reversing old transaction amount");
    Account account = oldTransaction.getAccount();
    BigDecimal currentBalance = account.getCurrentBalance() != null
            ? account.getCurrentBalance()
            : BigDecimal.ZERO;

    BigDecimal amountToAdj = getTransactionAmount(oldTransaction);
    account.setCurrentBalance(currentBalance.add(amountToAdj));
    accountRepository.save(account);
  }

  public void resetCurrentBalance(List<Transaction> transactionList){
    log.info("[Account] - Reset current balance by reversing old transaction list amount");
    Map<Long, Account> accountMap = transactionList.stream().map(Transaction::getAccount)
            .collect(Collectors.toMap(Account::getId, Function.identity(), (a,b)-> a));

    transactionList.forEach(txn -> {
      Account account = accountMap.get(txn.getAccount().getId());
      BigDecimal currentBalance = account.getCurrentBalance() != null
              ? account.getCurrentBalance()
              : BigDecimal.ZERO;

      BigDecimal amountToAdj = getTransactionAmount(txn);
      account.setCurrentBalance(currentBalance.add(amountToAdj));
    });
    accountRepository.saveAll(accountMap.values());
  }

  private BigDecimal getTransactionAmount(Transaction transaction) {
    if (transaction == null) {
      return BigDecimal.ZERO;
    }

    BigDecimal amount = transaction.getAmount();
    String txnNature = transaction.getTransactionType().getNature();

    if (TransactionNatureEnum.INC.getCode().equals(txnNature)) {
      return amount.negate();
    } else if (TransactionNatureEnum.EXP.getCode().equals(txnNature)) {
      return amount;
    } else {
      return amount.negate();
    }
  }

  public void updateCurrentBalance(Transaction transaction){
    log.info("[Account] - Update current balance by transaction amount");
    Account account = transaction.getAccount();
    BigDecimal currentBalance = account.getCurrentBalance() != null
            ? account.getCurrentBalance()
            : BigDecimal.ZERO;

    BigDecimal adjustedAmt = getTransactionAmount(transaction).negate();
    account.setCurrentBalance(currentBalance.add(adjustedAmt));
    accountRepository.save(account);
  }

  public void updateCurrentBalance(List<Transaction> transactions){
    log.info("[Account] - Update multiple current balance by transaction amount");
    List<Account> accounts = new ArrayList<>();
    transactions.forEach(txn -> {
      Account account = txn.getAccount();
      BigDecimal currentBalance = account.getCurrentBalance() != null
              ? account.getCurrentBalance()
              : BigDecimal.ZERO;
      BigDecimal adjustedAmt = getTransactionAmount(txn).negate();
      account.setCurrentBalance(currentBalance.add(adjustedAmt));
      accounts.add(account);
    });
    accountRepository.saveAll(accounts);
  }

  private void createAdjustedTxn(User user, Account account, BigDecimal updatedAmount){
    if(account.getCurrentBalance().compareTo(updatedAmount) == 0){
      return;
    }

    boolean hasTxnBfr = transactionRepository.countTransactionByAccId(user.getId(), account.getId()) > 0;
    if(hasTxnBfr){
      log.info("[Account] - Manually add an extra adjusted txn");
      TransactionType transactionType = transactionTypeRepository.findByLabel("Adjust")
              .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.TXN_TYPE_ID_NOT_FOUND_OR_INVALID));

      BigDecimal diff = updatedAmount.subtract(account.getCurrentBalance());
      Transaction adjustedTransaction = new Transaction(user, transactionType, null, account,
              "Balance adjustment", diff, LocalDate.now(ZoneId.of("Asia/Kuala_Lumpur")),
              null);
      transactionRepository.save(adjustedTransaction);
    }
  }
}
