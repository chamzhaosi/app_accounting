package com.accounting.accounting.account.repository.acctype;

import com.accounting.accounting.account.entity.acctype.AccountType;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@NullMarked
public interface AccountTypeRepository extends JpaRepository<AccountType, Long> {
    @Query("""
    SELECT t
    FROM AccountType t
    WHERE (t.user.id = :userId OR t.user IS NULL)
      AND t.isActive = true AND t.deletedAt IS NULL
    """)
    Page<AccountType> findActiveUserAndSystemTypes(@Param("userId") Long userId, Pageable pageable);

    @Query("""
    SELECT COUNT(t)
    FROM AccountType t
    WHERE (t.user.id = :userId OR t.user IS NULL)
      AND t.label = :label AND t.deletedAt IS NULL
    """)
    int countByUserIdAndLabel(@Param("userId") Long userId,
                              @Param("label") String label);

    @Query("""
    SELECT t
    FROM AccountType t
    WHERE (t.user.id = :userId OR t.user IS NULL)
        AND t.deletedAt IS NULL
    """)
    Page<AccountType> findAllByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("""
    SELECT t
    FROM AccountType t
    WHERE (t.user.id = :userId OR t.user IS NULL)
        AND t.id IN (:ids)
        AND t.deletedAt IS NULL
    """)
    List<AccountType> findByIds(@Param("userId") Long userId,
                                @Param("ids") List<Long> ids);

    @Query("""
    SELECT t
    FROM AccountType t
    WHERE (t.user.id = :userId OR t.user IS NULL)
        AND t.id = :id
        AND t.deletedAt IS NULL
    """)
    Optional<AccountType> findById(@Param("userId") Long userId,
                                   @Param("id") Long id);
}
