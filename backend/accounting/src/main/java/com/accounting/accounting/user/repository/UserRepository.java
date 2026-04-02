package com.accounting.accounting.user.repository;

import com.accounting.accounting.user.entity.User;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<@NotNull User, @NotNull Long> {
  boolean existsByEmailIgnoreCaseAndIsActiveTrue(String email);

  Optional<User> findByEmailIgnoreCaseAndIsActiveTrue(String email);
}
