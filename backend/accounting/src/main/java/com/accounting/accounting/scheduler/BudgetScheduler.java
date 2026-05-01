package com.accounting.accounting.scheduler;

import com.accounting.accounting.budget.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BudgetScheduler {

  private final BudgetService budgetService;

  @Scheduled(cron = "0 0 0 1 * *", zone = "Asia/Kuala_Lumpur")
  public void createMonthlyBudget() {
    budgetService.createBudgetForCurrentMonthIfNotExists();
  }

  @EventListener(ApplicationReadyEvent.class)
  public void runAfterStartup() {
    budgetService.createBudgetForCurrentMonthIfNotExists();
  }
}
