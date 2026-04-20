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
import com.accounting.accounting.common.enums.TransactionNatureEnum;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
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

  public Object getTxnDtlById(Long id){
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Transaction][Update] - User ({}) get txn detail by id ({})", user.getEmail(), id);
    Transaction transaction = transactionRepository.findById(user.getId(), id)
            .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));

    if(transaction.getTransferGroupId() == null){
      return transactionMapper.toResponse(transaction);
    }else{
      Transaction grpTransaction = transactionRepository
              .findByTransferGroupId(user.getId(), transaction.getId(), transaction.getTransferGroupId())
              .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.TSF_GROUP_TXN_ID_NOT_FOUND));

      if(transaction.getAmount().compareTo(BigDecimal.ZERO) < 0){
        return transactionMapper.toTransferResponse(transaction, grpTransaction);
      }else{
        return transactionMapper.toTransferResponse(grpTransaction, transaction);
      }
    }
  }

  @Override
  @Transactional
  public TransactionResponse create(TransactionCreateRequest request) {
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Transaction][Create] - User ({}) create new transaction", user.getEmail());

    TransactionType transactionType = transactionTypeService.getTransactionTypeByIds(user.getId(), request.getTxnTypeId());
    if(!List.of(TransactionNatureEnum.INC.getCode(), TransactionNatureEnum.EXP.getCode())
            .contains(transactionType.getNature())){
      throw new InvalidArgumentException(ExceptionEnum.TXN_TYPE_NOT_SUPPORTED);
    }

    Category category = categoryService.getCategoryById(user.getId(), request.getCtgrId());
    Account account = accountService.getAccountById(user.getId(), request.getAccId());

    Transaction transaction = new Transaction(
            user, transactionType, category, account, request.getDescription(),
            request.getAmount(), request.getTxnDate(), null);
    accountService.updateCurrentBalance(account, transaction);
    return transactionMapper.toResponse(transactionRepository.save(transaction));
  }

  @Transactional
  public TransactionTransferResponse transfer(TransactionTransferRequest request){
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Transaction][Create] - User ({}) create a transfer transaction", user.getEmail());

    TransactionType transactionType = transactionTypeService.getTransactionTypeByIds(user.getId(), request.getTxnTypeId());
    if(!TransactionNatureEnum.TSF.getCode().equals(transactionType.getNature())){
      throw new InvalidArgumentException(ExceptionEnum.TXN_TYPE_NOT_SUPPORTED);
    }

    String groupId = UUID.randomUUID().toString();
    Account fromAccount =  accountService.getAccountById(user.getId(), request.getFromAccId());
    Transaction fromTransaction = new Transaction(
            user, transactionType, null, fromAccount, request.getDescription(),
            request.getAmount().negate(), request.getTxnDate(), groupId
    );
    accountService.updateCurrentBalance(fromAccount, fromTransaction);

    Account toAccount =  accountService.getAccountById(user.getId(), request.getToAccId());
    Transaction toTransaction = new Transaction(
            user, transactionType, null, toAccount, request.getDescription(),
            request.getAmount(), request.getTxnDate(),groupId
    );
    accountService.updateCurrentBalance(toAccount, toTransaction);

    List<Transaction> transactionList = List.of(fromTransaction, toTransaction);
    transactionRepository.saveAll(transactionList);

    return transactionMapper.toTransferResponse(fromTransaction, toTransaction);
  }

  @Override
  @Transactional
  public TransactionResponse update(TransactionUpdateRequest request) {
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Transaction][Update] - User ({}) update transaction by id ({})", user.getEmail(), request.getId());

    TransactionType transactionType = transactionTypeService.getTransactionTypeByIds(user.getId(), request.getTxnTypeId());
    Transaction transaction = transactionRepository.findById(user.getId(), request.getId())
            .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));
    Category category = categoryService.getCategoryById(user.getId(), request.getCtgrId());
    Account account = accountService.getAccountById(user.getId(), request.getAccId());
    accountService.resetCurrentBalance(account, transaction);

    transaction.setTransactionType(transactionType);
    transaction.setCategory(category);
    transaction.setAccount(account);
    transaction.setAmount(request.getAmount());
    transaction.setDescription(request.getDescription());
    transaction.setTxnDate(request.getTxnDate());

    accountService.updateCurrentBalance(account, transaction);
    return transactionMapper.toResponse(transactionRepository.save(transaction));
  }

  @Transactional
  public TransactionTransferResponse updateTransfer(TransactionUpdateTransferRequest request){
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Transaction][Update] - User ({}) update transfer transaction by fromId ({}) and toId ({})"
            , user.getEmail(), request.getFromId(), request.getToId());
    List<Transaction> preTxnList = transactionRepository.findByIds(user.getId(), List.of(request.getFromId(), request.getToId()));
    Transaction preFromTxn = preTxnList.getFirst();
    Transaction preToTxn = preTxnList.getLast();

    if(preTxnList.size() != 2 ||
            !preFromTxn.getTransferGroupId().equals(preToTxn.getTransferGroupId())){
      throw new InvalidArgumentException(ExceptionEnum.TSF_GROUP_TXN_ID_NOT_FOUND);
    }

    accountService.resetCurrentBalance(preFromTxn.getAccount(), preFromTxn);
    accountService.resetCurrentBalance(preToTxn.getAccount(), preToTxn);

    Account fromAccount =  accountService.getAccountById(user.getId(), request.getFromAccId());
    preFromTxn.setAccount(fromAccount);
    preFromTxn.setAmount(request.getAmount());
    preFromTxn.setDescription(request.getDescription());
    preFromTxn.setTxnDate(request.getTxnDate());
    accountService.updateCurrentBalance(fromAccount, preFromTxn);

    Account toAccount =  accountService.getAccountById(user.getId(), request.getToAccId());
    preToTxn.setAccount(toAccount);
    preToTxn.setAmount(request.getAmount());
    preToTxn.setDescription(request.getDescription());
    preToTxn.setTxnDate(request.getTxnDate());
    accountService.updateCurrentBalance(toAccount, preToTxn);

    List<Transaction> transactionList = List.of(preFromTxn, preToTxn);
    transactionRepository.saveAll(transactionList);
    return transactionMapper.toTransferResponse(preFromTxn, preToTxn);
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


    Map<Account, BigDecimal> result = transactions.stream().collect(Collectors.groupingBy(
            Transaction::getAccount, Collectors.reducing(BigDecimal.ZERO,
                    Transaction::getAmount, BigDecimal::add))
    );

    transactions.forEach(t -> {
      t.setDeletedAt(LocalDateTime.now());
      t.setDeletedBy(user.getEmail());
//      Account account = t.getAccount();
//      accountService.updateCurrentBalance(account, t.getAmount().negate();
    });
    transactionRepository.saveAll(transactions);
  }
}
