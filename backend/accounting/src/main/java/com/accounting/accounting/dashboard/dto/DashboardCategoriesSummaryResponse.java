package com.accounting.accounting.dashboard.dto;

import com.accounting.accounting.dashboard.dto.common.DashboardCategoriesSummary;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class DashboardCategoriesSummaryResponse {
  List<DashboardCategoriesSummary> incomeCategoryList;
  List<DashboardCategoriesSummary> expenseCategoryList;
}
