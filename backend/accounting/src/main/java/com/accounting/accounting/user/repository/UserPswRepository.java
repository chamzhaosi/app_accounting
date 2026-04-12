package com.accounting.accounting.user.repository;

import com.accounting.accounting.user.entity.UserPsw;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPswRepository extends JpaRepository<@NotNull UserPsw, @NotNull Long> {
  Optional<UserPsw> findTopByUserIdOrderByCreatedAtDesc(Long id);
  Optional<UserPsw> findByUserIdAndStatus(Long userId, String status);
}
