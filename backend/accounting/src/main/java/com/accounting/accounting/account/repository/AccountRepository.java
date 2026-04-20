package com.accounting.accounting.account.repository;

import com.accounting.accounting.account.entity.Account;
import com.accounting.accounting.common.repository.BaseRepositoryItf;
import jakarta.validation.constraints.Null;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@NullMarked
public interface AccountRepository
        extends BaseRepositoryItf<Account, Long> {

  @Query("""
    SELECT COUNT(a)
    FROM Account a
    WHERE a.user.id = :userId
      AND (:accId IS NULL or a.id <> :accId)
      AND a.label = :label
      AND a.type.id = :accTypeId
      AND a.deletedAt IS NULL
    """)
  int countBySameData(@Param("userId") Long userId,
                      @Nullable @Param("accId") Long accId,
                      @Param("accTypeId") Long accTypeId,
                      @Param("label") String label);


  @Query(
          """
          SELECT a
          FROM Account a
          WHERE a.user.id = :userId
              AND (:label IS NULL OR LOWER(a.label) LIKE LOWER(CONCAT('%', :label, '%')))
              AND a.type.id = :accTypeId
              AND a.isActive = :isActive
              AND a.deletedAt IS NULL
          """
  )
  Page<Account> search(@Param("userId") Long userId,
                       @Nullable @Param("label") String label,
                       @Param("accTypeId") Long accTypeId,
                       @Param("isActive") Boolean isActive,
                       Pageable pageable);
}
