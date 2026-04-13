package com.accounting.accounting.user.repository;

import com.accounting.accounting.user.entity.UserLgn;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserLgnRepository extends JpaRepository<@NotNull UserLgn, @NotNull Long> {
    Optional<UserLgn> findTopByUserIdOrderByCreatedAtDesc(Long userId);
}
