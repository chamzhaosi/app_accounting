package com.accounting.accounting.user.repository;

import com.accounting.accounting.user.entity.UserForgetPsw;
import com.accounting.accounting.user.entity.UserRefreshToken;
import jakarta.validation.constraints.NotNull;
import java.lang.reflect.Array;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRefreshTokenRepository extends JpaRepository<@NotNull UserRefreshToken, @NotNull Long> {
  Optional<UserRefreshToken> findByToken(String Token);
  Optional<List<UserRefreshToken>> findByUserIdAndStatus(Long userId, String Status);
}
