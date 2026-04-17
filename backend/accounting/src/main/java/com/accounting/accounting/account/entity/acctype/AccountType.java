package com.accounting.accounting.account.entity.acctype;

import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import org.jspecify.annotations.Nullable;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "account_types", uniqueConstraints = {
    @UniqueConstraint(name="uq_acc_types_user_label",
            columnNames = {"user_id", "active_label"})})
public class AccountType extends EntityBase {
  @NonNull
  private Long id;

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

  public AccountType(@NonNull User user,@NonNull String label){
    super(user.getEmail(), user.getEmail());
    this.user = user;
    this.label = label;
  }
}
