package com.accounting.accounting.transaction.dto.common;

import com.accounting.accounting.category.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionCategoriesSummary {
  private Category category;
  private BigDecimal amount;
}
