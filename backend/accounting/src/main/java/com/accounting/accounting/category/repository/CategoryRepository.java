package com.accounting.accounting.category.repository;

import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long>{

//    @Query("""
//    SELECT c
//    FROM Category c
//    WHERE c.user.id = :userId
//      AND c.isActive = true
//      AND c.deletedAt IS NULL
//    """)
//    Page<Category> findAllActive(@Param("userId") Long userId,
//                                                Pageable pageable);

    @Query("""
    SELECT COUNT(c)
    FROM Category c
    WHERE c.user.id = :userId
      AND c.label = :label
      AND c.deletedAt IS NULL
    """)
    int countByUserIdAndLabel(@Param("userId") Long userId,
                              @Param("label") String label);

//    @Query("""
//    SELECT c
//    FROM Category c
//    WHERE c.user.id = :userId
//        AND c.deletedAt IS NULL
//    """)
//    Page<Category> findAllByUserId(@Param("userId") Long userId,
//                                   Pageable pageable);

    @Query("""
    SELECT c
    FROM Category c
    WHERE c.user.id = :userId
        AND c.id IN (:ids)
        AND c.deletedAt IS NULL
    """)
    List<Category> findByIds(@Param("userId") Long userId,
                             @Param("ids") List<Long> ids);

    @Query(
    """
    SELECT c
    FROM Category c
    WHERE c.user.id = :userId
        AND c.id = :id
        AND c.deletedAt IS NULL
    """
    )
    Optional<Category> findById(@Param("userId") Long userId,
                                @Param("id") Long id);

    @Query(
    """
    SELECT c
    FROM Category c
    WHERE c.user.id = :userId
        AND (c.label IS NULL or c.label = :label)
        AND c.type.id = :txnTypeId
        AND c.isActive = :isActive
        AND c.deletedAt IS NULL
    """
    )
    Page<Category> findAll(@Param("userId") Long userId,
                           @Param("label") String label,
                           @Param("txnTypeId") Long txnTypeId,
                           @Param("isActive") Boolean isActive,
                           Pageable pageable);
}
