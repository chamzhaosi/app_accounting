package com.accounting.accounting.user.repository;

import com.accounting.accounting.user.entity.UserForgetPsw;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserForgetPswRepository extends JpaRepository<@NotNull UserForgetPsw, @NotNull Long> {

  Optional<UserForgetPsw> findByToken(String token);
  Optional<UserForgetPsw> findTopByUserIdOrderByCreatedAtDesc(Long id);
}
