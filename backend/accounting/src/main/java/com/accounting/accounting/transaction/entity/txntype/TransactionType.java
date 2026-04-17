package com.accounting.accounting.transaction.entity.txntype;

import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.common.enums.TransactionNatureEnum;
import com.accounting.accounting.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.jspecify.annotations.Nullable;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "transaction_types", uniqueConstraints = {
    @UniqueConstraint(name="uq_txn_types_user_active_label",
        columnNames = {"user_id", "active_label"})
})
@NoArgsConstructor
public class TransactionType extends EntityBase {
    @NonNull
    private Long id;

    @Nullable
    private Long nature;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @NonNull
    @Column(nullable = false, length = 50)
    private String label;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;

    public TransactionType(User user, String label, @Nullable TransactionNatureEnum nature){
        super(user.getEmail(), user.getEmail());
        this.user = user;
        this.label = label;
        this.nature = nature != null ? nature.getCode(): null;
    }
}
