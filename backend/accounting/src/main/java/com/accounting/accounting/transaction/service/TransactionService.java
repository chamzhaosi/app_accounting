package com.accounting.accounting.transaction.service;

import com.accounting.accounting.account.entity.Account;
import com.accounting.accounting.account.entity.acctype.AccountType;
import com.accounting.accounting.account.repository.AccountRepository;
import com.accounting.accounting.account.repository.acctype.AccountTypeRepository;
import com.accounting.accounting.account.service.AccountService;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.category.repository.CategoryRepository;
import com.accounting.accounting.category.service.CategoryService;
import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.transaction.dto.*;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeResponse;
import com.accounting.accounting.transaction.entity.Transaction;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.accounting.accounting.transaction.mapper.TransactionMapper;
import com.accounting.accounting.transaction.repository.TransactionRepository;
import com.accounting.accounting.transaction.repository.txntype.TransactionTypeRepository;
import com.accounting.accounting.transaction.service.itf.TransactionServiceItf;
import com.accounting.accounting.transaction.service.txntype.TransactionTypeService;
import com.accounting.accounting.user.entity.User;
import lombok.NonNull;
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
public class TransactionService implements TransactionServiceItf {
  private final TransactionRepository transactionRepository;
  private final TransactionTypeService transactionTypeService;
  private final AccountService accountService;
  private final CategoryService categoryService;
  private final TransactionMapper transactionMapper;

  @Override
  public Page<@NonNull TransactionResponse> findAll(TransactionSearchRequest request, Pageable pageable) {
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Transaction][Find All]  - User ({}) fetch all transaction with params ({})", user.getEmail(), request.toString());
    return transactionRepository.search(user.getId(),
                    request.getTxnTypeId(),
                    request.getCtgrId(),
                    request.getAccId(),
                    request.getDescription(),
                    request.getTxnDate(),
                    request.getSttTxnDate(),
                    request.getEndTxnDate(),
                    pageable)
            .map(transactionMapper::toResponse);
  }

  @Override
  @Transactional
  public TransactionResponse create(TransactionCreateRequest request) {
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Transaction][Create] - User ({}) create new transaction", user.getEmail());

    TransactionType transactionType = transactionTypeService.getTransactionTypeByIds(user.getId(), request.getTxnTypeId());
    Category category = categoryService.getCategoryById(user.getId(), request.getCtgrId());
    Account account = accountService.getAccountById(user.getId(), request.getAccId());

    Transaction transaction = new Transaction(
            user, transactionType, category, account, request.getDescription(),
            request.getAmount(), request.getTxnDate());
    return transactionMapper.toResponse(transactionRepository.save(transaction));
  }

  @Override
  @Transactional
  public TransactionResponse update(TransactionUpdateRequest request) {
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Transaction][Update] - User ({}) update transaction by id ({})", user.getEmail(), request.getId());

    Transaction transaction = transactionRepository.findById(user.getId(), request.getId())
            .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));
    TransactionType transactionType = transactionTypeService.getTransactionTypeByIds(user.getId(), request.getTxnTypeId());
    Category category = categoryService.getCategoryById(user.getId(), request.getCtgrId());
    Account account = accountService.getAccountById(user.getId(), request.getAccId());

    transaction.setTransactionType(transactionType);
    transaction.setCategory(category);
    transaction.setAccount(account);
    transaction.setAmount(request.getAmount());
    transaction.setDescription(request.getDescription());
    transaction.setTxnDate(request.getTxnDate());
    transactionRepository.save(transaction);

    return transactionMapper.toResponse(transaction);
  }

  @Override
  @Transactional
  public void deleteByIds(TransactionDeleteRequest request) {
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info(
            "[Transaction][Delete] - User ({}) delete transaction : [{}]",
            user.getEmail(),
            request.getIds().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(", "))
    );

    List<Transaction> transactions = transactionRepository.findByIds(user.getId(), request.getIds());
    if(transactions.isEmpty()){
      throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND);
    }

    transactions.forEach(c -> {
      c.setDeletedAt(LocalDateTime.now());
      c.setDeletedBy(user.getEmail());
    });
    transactionRepository.saveAll(transactions);
  }
}
