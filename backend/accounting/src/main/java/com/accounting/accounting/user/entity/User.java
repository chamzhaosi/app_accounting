package com.accounting.accounting.user.entity;

import com.accounting.accounting.common.entity.EntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@RequiredArgsConstructor
@NoArgsConstructor
@Table(name="users")
public class User extends EntityBase {
  @NonNull
  @Column(nullable = false, length = 100)
  private String email;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;
}
