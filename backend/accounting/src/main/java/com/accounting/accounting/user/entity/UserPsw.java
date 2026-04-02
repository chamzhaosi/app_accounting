package com.accounting.accounting.user.entity;

import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.common.enums.UserPwsStatusEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "users_psw")
@RequiredArgsConstructor
@NoArgsConstructor
public class UserPsw extends EntityBase {
  @NonNull
  @Column(name = "password", nullable = false)
  private String hashedPassword;

  @NonNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  @NonNull
  @Column(name = "expired_at", nullable = false)
  private LocalDateTime expiredAt;

  private String status = UserPwsStatusEnum.ACTIVE.getCode();
}
