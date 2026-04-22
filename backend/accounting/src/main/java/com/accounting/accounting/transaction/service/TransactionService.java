package com.accounting.accounting.transaction.service;

import com.accounting.accounting.account.entity.Account;
import com.accounting.accounting.account.service.AccountService;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.category.service.CategoryService;
import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.enums.TransactionNatureEnum;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.transaction.dto.adjustment.TransactionAdjustResponse;
import com.accounting.accounting.transaction.dto.adjustment.TransactionUpdateAdjustRequest;
import com.accounting.accounting.transaction.dto.transaction.*;
import com.accounting.accounting.transaction.dto.transfer.*;
import com.accounting.accounting.transaction.entity.Transaction;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.accounting.accounting.transaction.mapper.TransactionMapper;
import com.accounting.accounting.transaction.repository.TransactionRepository;
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
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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

    TransactionType transactionType = getAndCheckTransactionType(user.getId(), request.getTxnTypeId(),
            List.of(TransactionNatureEnum.INC.getCode(), TransactionNatureEnum.EXP.getCode()));
    Category category = getAndCheckCategory(user.getId(), request.getCtgrId(), transactionType);

    Account account = accountService.getAccountById(user.getId(), request.getAccId());
    Transaction transaction = new Transaction(
            user, transactionType, category, account, request.getDescription(),
            request.getAmount(), request.getTxnDate(), null);
    accountService.updateCurrentBalance(transaction);
    return transactionMapper.toResponse(transactionRepository.save(transaction));
  }

  @Transactional
  public TransactionsTransferResponse transfer(TransactionsCreateTransferRequest request){
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Transaction][Create] - User ({}) create a transfer transaction", user.getEmail());

    TransactionType transactionType = getAndCheckTransactionType(user.getId(), request.getTxnTypeId(),
            List.of(TransactionNatureEnum.TSF.getCode()));

    String groupId = UUID.randomUUID().toString();
    Map<Long, Account> accountMap = getIdAccountMap(user.getId(), request.getFromAccId(), request.getToAccId());

    if(accountMap.size() != 2){
      throw new InvalidArgumentException(ExceptionEnum.ACC_ID_NOT_FOUND_OR_INVALID);
    }

    Account fromAccount = accountMap.get(request.getFromAccId());
    Transaction fromTransaction = new Transaction(
            user, transactionType, null, fromAccount, request.getDescription(),
            request.getAmount().negate(), request.getTxnDate(), groupId
    );
    Account toAccount = accountMap.get(request.getToAccId());
    Transaction toTransaction = new Transaction(
            user, transactionType, null, toAccount, request.getDescription(),
            request.getAmount(), request.getTxnDate(),groupId
    );

    List<Transaction> transactionList = List.of(fromTransaction, toTransaction);
    accountService.updateCurrentBalance(transactionList);
    transactionRepository.saveAll(transactionList);
    return transactionMapper.toTransferResponse(fromTransaction, toTransaction);
  }

  @Override
  @Transactional
  public TransactionResponse update(TransactionUpdateRequest request) {
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Transaction][Update] - User ({}) update transaction by id ({})", user.getEmail(), request.getId());

    TransactionType transactionType = getAndCheckTransactionType(user.getId(), request.getTxnTypeId(),
            List.of(TransactionNatureEnum.INC.getCode(), TransactionNatureEnum.EXP.getCode()));
    Transaction transaction = getTransaction(user.getId(), request.getId());
    Common.validateVersionMatch(request, transaction);
    accountService.resetCurrentBalance(transaction);

    Category category = getAndCheckCategory(user.getId(), request.getCtgrId(), transactionType);
    Account account = accountService.getAccountById(user.getId(), request.getAccId());

    transaction.setTransactionType(transactionType);
    transaction.setCategory(category);
    transaction.setAccount(account);
    transaction.setAmount(request.getAmount());
    transaction.setDescription(request.getDescription());
    transaction.setTxnDate(request.getTxnDate());

    accountService.updateCurrentBalance(transaction);
    return transactionMapper.toResponse(transactionRepository.save(transaction));
  }

  @Transactional
  public TransactionAdjustResponse updateAdjust(TransactionUpdateAdjustRequest request){
    User user = Common.getAuthenticateUserNThrowException(null);
    log.info("[Transaction][Update] - User ({}) update adjustment transaction by id ({})", user.getEmail(), request.getId());

    getAndCheckTransactionType(user.getId(), request.getTxnTypeId(), List.of(TransactionNatureEnum.ADJ.getCode()));
    Transaction transaction = getTransaction(user.getId(), request.getId());
    Common.validateVersionMatch(request, transaction);
    accountService.resetCurrentBalance(transaction);

    Account account = accountService.getAccountById(user.getId(), request.getAccId());

    transaction.setDescription(request.getDescription());
    transaction.setAccount(account);
    transaction.setAmount(request.getAmount());
    transaction.setDescription(request.getDescription());
    transaction.setTxnDate(request.getTxnDate());
    accountService.updateCurrentBalance(transaction);
    return transactionMapper.toAdjustResponse(transaction);
  }

  @Transactional
  public TransactionsTransferResponse updateTransfer(TransactionsUpdateTransferRequest request){
    User user = Common.getAuthenticateUserNThrowException(null);
    checkUpdateTransferRequest(request);

    Long formTxnId = request.getFromTransaction().getId();
    Long toTxnId =  request.getToTransaction().getId();
    log.info("[Transaction][Update] - User ({}) update transfer transaction by fromId ({}) and toId ({})"
            , user.getEmail(), formTxnId, toTxnId);

    List<Transaction> prevTxnList = getTransactions(user.getId(), List.of(formTxnId, toTxnId));
    Map<Long, Transaction> transactionMap = prevTxnList.stream()
            .collect(Collectors.toMap(Transaction::getId, Function.identity()));
    Transaction preFromTxn = transactionMap.get(formTxnId);
    Transaction preToTxn = transactionMap.get(toTxnId);
    Common.validateListVersionMatch(List.of(
            request.getFromTransaction(), request.getToTransaction()
    ), prevTxnList);

    boolean invalidTransferPair =
            preFromTxn == null
                    || preToTxn == null
                    || preFromTxn.getTransferGroupId() == null
                    || !Objects.equals(preFromTxn.getTransferGroupId(), preToTxn.getTransferGroupId());

    if (invalidTransferPair) {
      throw new InvalidArgumentException(ExceptionEnum.TSF_GROUP_TXN_ID_NOT_FOUND);
    }

    accountService.resetCurrentBalance(prevTxnList);

    Long formAccId = request.getFromTransaction().getAccId();
    Long toAccId =  request.getToTransaction().getAccId();
    List<Account> accounts =  accountService.getAccountByIds(user.getId(), List.of(formAccId, toAccId));
    Map<Long, Account> accountMap = accounts.stream().collect(Collectors.toMap(Account::getId, Function.identity()));

    Account fromAccount = accountMap.get(formAccId);
    preFromTxn.setAccount(fromAccount);
    preFromTxn.setAmount(request.getFromTransaction().getAmount().abs().negate());
    preFromTxn.setDescription(request.getFromTransaction().getDescription());
    preFromTxn.setTxnDate(request.getFromTransaction().getTxnDate());

    Account toAccount = accountMap.get(toAccId);
    preToTxn.setAccount(toAccount);
    preToTxn.setAmount(request.getToTransaction().getAmount().abs());
    preToTxn.setDescription(request.getToTransaction().getDescription());
    preToTxn.setTxnDate(request.getToTransaction().getTxnDate());

    List<Transaction> transactionList = List.of(preFromTxn, preToTxn);
    accountService.updateCurrentBalance(transactionList);
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

    List<Transaction> transactions = getTransactions(user.getId(), request.getIds());
    List<String> uniqueGroupIds = transactions.stream()
            .map(Transaction::getTransferGroupId)
            .filter(Objects::nonNull)
            .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
            .entrySet().stream()
            .filter(m -> m.getValue() == 1)
            .map(Map.Entry::getKey)
            .toList();

    List<Transaction> transferTransactions = new ArrayList<>(transactionRepository.findByTransferGroupIds(user.getId(), uniqueGroupIds));
    Map<Long, Transaction> uniqueTransactions = Stream.concat(
                    transactions.stream(),
                    transferTransactions.stream()
            )
            .collect(Collectors.toMap(
                    Transaction::getId,
                    Function.identity(),
                    (a, b) -> a,
                    LinkedHashMap::new
            ));
    List<Transaction> finalTransactions = new ArrayList<>(uniqueTransactions.values());
    LocalDateTime now = LocalDateTime.now();

    accountService.resetCurrentBalance(finalTransactions);
    finalTransactions.forEach(t -> {
      t.setDeletedAt(now);
      t.setDeletedBy(user.getEmail());
    });
    transactionRepository.saveAll(finalTransactions);
  }

  private Map<Long, Account> getIdAccountMap (Long userId, Long fromAccId, Long toAccId){
    List<Account> accounts = accountService
            .getAccountByIds(userId, List.of(fromAccId, toAccId));
    return accounts.stream()
            .collect(Collectors.toMap(Account::getId, Function.identity()));
  }

  private TransactionType getAndCheckTransactionType (Long userId, Long txnTypeId, List<String> validTxnTypeList){
    TransactionType transactionType = transactionTypeService.getTransactionTypeById(userId, txnTypeId);
    if(!validTxnTypeList.contains(transactionType.getNature())){
      throw new InvalidArgumentException(ExceptionEnum.TXN_TYPE_NOT_SUPPORTED);
    }
    return transactionType;
  }

  private Category getAndCheckCategory(Long userId, Long ctgrId, TransactionType transactionType){
    Category category = categoryService.getCategoryById(userId, ctgrId);
    if(!category.getType().equals(transactionType)){
      throw new InvalidArgumentException(ExceptionEnum.TXN_TYPE_AND_CTGR_NOT_MATCH);
    }
    return category;
  }

  private Transaction getTransaction(Long userId, Long txnId){
    return transactionRepository.findById(userId, txnId)
            .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));
  }

  private List<Transaction> getTransactions(Long userId, List<Long> txnIds){
    List<Transaction> transactions = new ArrayList<>(transactionRepository.findByIds(userId, txnIds));
    if(transactions.isEmpty()){
      throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND);
    }
    return transactions;
  }

  private void checkUpdateTransferRequest(TransactionsUpdateTransferRequest request){
    List<TransactionTransferRequest> transactionTransfers = Stream.of(
                    request.getFromTransaction(),
                    request.getToTransaction()
            )
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(ArrayList::new));

    TransactionTransferRequest t1 = transactionTransfers.get(0);
    TransactionTransferRequest t2 = transactionTransfers.get(1);

    boolean notEqual =
            !Objects.equals(t1.getDescription(), t2.getDescription()) ||
                    t1.getAmount().abs().compareTo(t2.getAmount().abs()) != 0 ||
                    !Objects.equals(t1.getTxnDate(), t2.getTxnDate());

    if(notEqual){
      throw new InvalidArgumentException(ExceptionEnum.BOTH_TXN_DATA_MUST_BE_EQUAL);
    }
  }
}
