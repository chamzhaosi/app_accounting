package com.accounting.accounting.transaction.entity;

import com.accounting.accounting.account.entity.AccountType;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "transactions")
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
    @JoinColumn(name = "acc_type_id", referencedColumnName = "id")
    private AccountType accountType;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
}
