package com.accounting.accounting.category.entity;

import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.transaction.entity.TransactionType;
import com.accounting.accounting.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "categories", uniqueConstraints = {
    @UniqueConstraint(name = "uq_ctgr_user_label",
        columnNames = {"user_id", "txn_type_id", "label"})
})
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
}
