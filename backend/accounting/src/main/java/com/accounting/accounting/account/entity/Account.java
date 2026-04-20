package com.accounting.accounting.account.entity;

import com.accounting.accounting.account.dto.AccountCreateRequest;
import com.accounting.accounting.account.dto.AccountUpdateRequest;
import com.accounting.accounting.account.entity.acctype.AccountType;
import com.accounting.accounting.common.entity.EntityBase;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.accounting.accounting.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name="accounts", uniqueConstraints = {
    @UniqueConstraint(name="uq_acc_user_acc_type_label",
        columnNames = {"user_id", "acc_type_id", "active_label"})
})
@NoArgsConstructor
public class Account extends EntityBase {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "acc_type_id", referencedColumnName = "id")
  private AccountType type;

  @Column(nullable = false, length = 50)
  @Size(message = "Label must not over 50 characters")
  private String label;

  @Column(nullable = false, length = 100)
  @Size(message = "Description must not over 100 characters")
  private String description;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;

  @Column(name="deleted_at")
  private LocalDateTime deletedAt;

  @Column(name="deleted_by")
  private String deletedBy;

  @Column(name = "is_main_account", nullable = false)
  private Boolean isMainAccount;

  @Column(precision = 10, scale = 2)
  private BigDecimal openingBalance = BigDecimal.valueOf(0.00);

  @Column(precision = 10, scale = 2)
  private BigDecimal currentBalance = BigDecimal.valueOf(0.00);

  public Account(User user, AccountType accTyp, AccountCreateRequest request){
    super(user.getEmail(), user.getEmail());
    this.user = user;
    this.type = accTyp;
    this.label = request.getLabel();
    this.description = request.getDescription();
    this.isMainAccount = request.getIsMainAccount();
    this.openingBalance = request.getAmount();
    this.currentBalance = request.getAmount();
  }
}
