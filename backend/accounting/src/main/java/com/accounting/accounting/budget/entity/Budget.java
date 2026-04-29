package com.accounting.accounting.budget.entity;

import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "budget", uniqueConstraints = {
        @UniqueConstraint(name = "uq_budget_user_id_month",
                columnNames = {"user_id", "month"})
})
public class Budget extends EntityBase {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", referencedColumnName = "id",  nullable = false)
  private User user;

  @Column(nullable = false)
  @Size(max = 12, min = 1, message = "Month should be the range 1 to 12 only")
  private LocalDate month;

  @Column(name = "total_budget", precision = 10, scale = 2, nullable = false)
  private BigDecimal totalBudget = BigDecimal.valueOf(0.00);

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;

  public Budget(User user, LocalDate month, BigDecimal totalBudget){
    super(user.getEmail(), user.getEmail());
    this.user = user;
    this.month = month;
    this.totalBudget = totalBudget;
  }
}
