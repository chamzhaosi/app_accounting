package com.accounting.accounting.transaction.entity;

import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "transaction_types", uniqueConstraints = {
    @UniqueConstraint(name="uq_txn_types_user_label",
        columnNames = {"user_id", "label"})
})
public class TransactionType extends EntityBase {
    @NonNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @NonNull
    @Column(nullable = false, length = 50)
    private String label;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public TransactionType(@NonNull User user,@NonNull String label){
        super(user.getEmail(), user.getEmail());
        this.user = user;
        this.label = label;
    }
}
