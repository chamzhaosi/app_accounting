package com.accounting.accounting.account.entity;

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
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name="accounts", uniqueConstraints = {
    @UniqueConstraint(name="uq_acc_user_acc_type_label",
        columnNames = {"user_id", "acc_type_id", "label"})
})
public class Account extends EntityBase {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "acc_type_id", referencedColumnName = "id")
  private AccountType accountType;

  @Column(nullable = false, length = 50)
  private String label;

  @Column(nullable = false, length = 100)
  private String description;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;
}
