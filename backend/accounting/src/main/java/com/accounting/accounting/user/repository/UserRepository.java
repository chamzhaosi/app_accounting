package com.accounting.accounting.user.repository;

import com.accounting.accounting.user.entity.User;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<@NotNull User, @NotNull Long> {

}
