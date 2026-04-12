package com.accounting.accounting.transaction.entity;

import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "transaction_types", uniqueConstraints = {
    @UniqueConstraint(name="uq_txn_types_user_label",
        columnNames = {"user_id", "label"})
})
public class TransactionType extends EntityBase {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
