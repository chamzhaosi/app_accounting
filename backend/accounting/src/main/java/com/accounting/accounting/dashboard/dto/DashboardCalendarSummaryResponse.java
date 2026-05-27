package com.accounting.accounting.dashboard.dto;

import com.accounting.accounting.dashboard.dto.common.DashboardDailySummary;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor
public class DashboardCalendarSummaryResponse {
  @NonNull
  List<DashboardDailySummary> dashboardDailySummaryList;
}
