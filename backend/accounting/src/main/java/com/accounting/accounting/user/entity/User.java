package com.accounting.accounting.user.entity;

import com.accounting.accounting.common.entity.EntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name="users")
public class User extends EntityBase {
  @Column(nullable = false, length = 100)
  private String email;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive;
}
