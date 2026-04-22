package com.accounting.accounting.common.entity;

import com.accounting.accounting.common.helper.Common;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@MappedSuperclass
@NoArgsConstructor
public abstract class EntityBase {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @CreationTimestamp
  @Column(name="created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name="created_by", nullable = false)
  private String createdBy;

  @UpdateTimestamp
  @Column(name="modified_at", nullable = false)
  private LocalDateTime modifiedAt;

  @Column(name="modified_by", nullable = false)
  private String modifiedBy;

  @Version
  @Column(nullable = false)
  private Long vrs;

  @PrePersist
  public void prePersist() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.modifiedAt = now;
    this.vrs = 0L;
  }

  @PreUpdate
  public void preUpdate() {
    this.modifiedAt = LocalDateTime.now();
  }

  protected EntityBase(String createdBy, String modifiedBy) {
    this.createdBy = createdBy;
    this.modifiedBy = modifiedBy;
  }
}
