package com.accounting.accounting.user.entity;

import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.common.enums.UserRefreshTokenStatusEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.jspecify.annotations.NullMarked;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "users_refresh_token")
@RequiredArgsConstructor
@NoArgsConstructor
public class UserRefreshToken extends EntityBase {
  @NonNull
  @Column(nullable = false)
  private String token;

  @NonNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  @NonNull
  @Column(name = "expired_at", nullable = false)
  private LocalDateTime expiredAt;

  @NonNull
  @Column(nullable = false)
  private String status = UserRefreshTokenStatusEnum.ACTIVE.getCode();

  @NullMarked
  public UserRefreshToken(User user, String token){
    super(user.getEmail(), user.getEmail());
    this.user = user;
    this.token = token;
    this.expiredAt = LocalDateTime.now().plusDays(7);
  }
}
