package com.accounting.accounting.category.entity;

import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.accounting.accounting.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "categories", uniqueConstraints = {
    @UniqueConstraint(name = "uq_ctgr_user_type_id_label",
        columnNames = {"user_id", "txn_type_id", "active_label"})
})
@NoArgsConstructor
public class Category extends EntityBase {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "txn_type_id", referencedColumnName = "id")
    private TransactionType type;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(nullable = false, length = 100)
    private String description;

    @Column(name="is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name="deleted_at")
    private LocalDateTime deletedAt;

    @Column(name="deleted_by")
    private String deletedBy;

    public Category(User user, TransactionType txnTyp, String label, String description){
        setUser(user);
        this.user = user;
        this.type = txnTyp;
        this.label = label;
        this.description = description;
    }
}
