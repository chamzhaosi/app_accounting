package com.accounting.accounting.budget.entity;

import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "budget_categories", uniqueConstraints = {
        @UniqueConstraint(name = "uq_budget_ctgrs_budget_ctgr_active_flag",
                columnNames = {"budget_id", "ctgr_id", "active_flag"})
})
public class BudgetCategory extends EntityBase {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "budget_id", referencedColumnName = "id", nullable = false)
  private Budget budget;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "ctgr_id", referencedColumnName = "id", nullable = false)
  private Category category;

  @Column(precision = 10, scale = 2, nullable = false)
  private BigDecimal amount = BigDecimal.valueOf(0.00);

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @Column(name = "deleted_by")
  private String deletedBy;

  public BudgetCategory(User user, Budget budget, Category category, BigDecimal amount){
    super(user.getEmail(), user.getEmail());
    this.budget = budget;
    this.category = category;
    this.amount = amount;
  }
}
