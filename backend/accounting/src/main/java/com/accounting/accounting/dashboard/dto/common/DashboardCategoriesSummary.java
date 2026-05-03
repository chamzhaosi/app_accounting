package com.accounting.accounting.dashboard.dto.common;


import com.accounting.accounting.category.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class DashboardCategoriesSummary {
  private Category category;
  private BigDecimal amount;
  private BigDecimal percentage;
}
