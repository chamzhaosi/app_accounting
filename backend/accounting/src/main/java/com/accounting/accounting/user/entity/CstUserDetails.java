package com.accounting.accounting.user.entity;

import java.util.Collection;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Setter
@AllArgsConstructor
public class CstUserDetails implements UserDetails {
  @Getter
  private Long userId;
  private String username;
  private String password;

  @Override
  public @NonNull Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of();
  }

  @Override
  public @Nullable String getPassword() {
    return this.password;
  }

  @Override
  public @NonNull String getUsername() {
    return this.username;
  }
}
