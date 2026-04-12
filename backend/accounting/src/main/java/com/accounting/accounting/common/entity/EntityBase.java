package com.accounting.accounting.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@MappedSuperclass
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

  @Column(nullable = false)
  private Long vrs;

  @PrePersist
  public void prePersist() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.modifiedAt = now;
  }

  @PreUpdate
  public void preUpdate() {
    this.modifiedAt = LocalDateTime.now();
  }
}
