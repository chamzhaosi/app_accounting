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
@Table(name = "account_types", uniqueConstraints = {
    @UniqueConstraint(name="uq_acc_types_user_label", columnNames = {"user_id", "label"})})
public class AccountType extends EntityBase {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="user_id", referencedColumnName = "id")
  private User user;

  @Column(nullable = false, length = 50)
  private String label;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;
}
