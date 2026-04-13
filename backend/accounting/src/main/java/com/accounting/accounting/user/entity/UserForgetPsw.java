package com.accounting.accounting.user.entity;

import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.common.enums.UserForgetPwsStatusEnum;
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
import org.jspecify.annotations.NullMarked;

@Getter
@Setter
@Entity
@Table(name = "users_forget_psw")
@RequiredArgsConstructor
@NoArgsConstructor
public class UserForgetPsw extends EntityBase {
  @NonNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  @NonNull
  @Column(name = "token", nullable = false, length = 255)
  private String token;

  @NonNull
  @Column(name = "expired_at", nullable = false)
  private LocalDateTime expiredAt;

  @NonNull
  private String status = UserForgetPwsStatusEnum.ACTIVE.getCode();

  @NullMarked
  public UserForgetPsw (User user, String token){
    super(user.getEmail(), user.getEmail());
    this.user = user;
    this.token = token;
    this.expiredAt = LocalDateTime.now().plusMinutes(3);
  }
}
