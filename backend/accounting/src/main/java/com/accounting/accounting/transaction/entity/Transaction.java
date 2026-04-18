package com.accounting.accounting.transaction.entity;

import com.accounting.accounting.account.entity.Account;
import com.accounting.accounting.account.entity.acctype.AccountType;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.accounting.accounting.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "transactions")
@NoArgsConstructor
public class Transaction extends EntityBase {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "txn_type_id", referencedColumnName = "id")
    private TransactionType transactionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ctgr_id", referencedColumnName = "id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acc_id", referencedColumnName = "id")
    private Account account;

    @Column(nullable = false)
    @Size(message = "Description must not over ")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "txn_date", nullable = false)
    private LocalDate txnDate;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;

  public Transaction(User user, TransactionType transactionType, Category category, Account account, String description, BigDecimal amount, LocalDate txnDate){
    super(user.getEmail(), user.getEmail());
    this.user = user;
    this.transactionType = transactionType;
    this.category = category;
    this.account = account;
    this.description = description;
    this.amount = amount;
    this.txnDate = txnDate;
  }
}
