package com.accounting.accounting.category.repository;

import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.transactionType.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByType(TransactionType type);
}
