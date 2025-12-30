package com.accounting.accounting.category.entity;

import com.accounting.accounting.transactionType.entity.TransactionType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(
    name = "categories",
    uniqueConstraints = @UniqueConstraint(columnNames = {"label", "type_id"}) // user_Id
)
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", referencedColumnName = "id")
    private TransactionType type;

    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

//    public TransactionType getType() {
//        return type;
//    }

    public String getType() {
        return type.getTypeCode();
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public void setDescription(String description){
        this.description = description;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }
}
