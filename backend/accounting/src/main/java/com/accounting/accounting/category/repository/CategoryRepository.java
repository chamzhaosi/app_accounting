package com.accounting.accounting.category.repository;

import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.transactionType.entity.TransactionType;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CategoryRepository extends JpaRepository<@NonNull Category, @NonNull Long>, JpaSpecificationExecutor<@NonNull Category> {
    Page<@NonNull Category> findAllByType(TransactionType type, Pageable pageable);
    Page<@NonNull Category> findAllByTypeAndIsActiveTrue(TransactionType type, Pageable pageable);

    boolean existsByLabelIgnoreCaseAndType_Id(String label, Long typeId);

    boolean existsByLabelIgnoreCaseAndType_IdAndIdNot(
            String label,
            Long typeId,
            Long id
    );

}
