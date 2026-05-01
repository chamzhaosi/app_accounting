package com.accounting.accounting.budget.dto.common;

import com.accounting.accounting.common.dto.BaseDto;
import lombok.Getter;

@Getter
public class BudgetCategoryUpdateRequest extends BudgetCategoryBaseRequest implements BaseDto {
  private Long id;
  private Long vrs;
}
