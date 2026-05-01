package com.accounting.accounting.account.repository.acctype;

import com.accounting.accounting.account.entity.acctype.AccountType;
import com.accounting.accounting.common.repository.BaseRepositoryItf;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@NullMarked
public interface AccountTypeRepository
        extends BaseRepositoryItf<AccountType, Long> {

    @Query("""
    SELECT COUNT(t)
    FROM AccountType t
    WHERE (t.user.id = :userId OR t.user IS NULL)
      AND (:accTypeId IS NULL or t.id <> :accTypeId)
      AND t.label = :label AND t.deletedAt IS NULL
    """)
    int countByUserIdAndLabel(@Param("userId") Long userId,
                              @Nullable @Param("accTypeId") Long accTypeId,
                              @Param("label") String label);

    @Query("""
    SELECT t
    FROM AccountType t
    WHERE (t.user.id = :userId OR t.user IS NULL)
        AND t.isActive = :isActive
        AND t.deletedAt IS NULL
    """)
    Page<AccountType> search(@Param("userId") Long userId,
                             @Param("isActive") Boolean isActive,
                             Pageable pageable);
}
