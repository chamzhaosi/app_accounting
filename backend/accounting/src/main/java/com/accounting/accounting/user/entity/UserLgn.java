package com.accounting.accounting.user.entity;

import com.accounting.accounting.common.entity.EntityBase;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name="users_lgn")
@RequiredArgsConstructor
@NoArgsConstructor
public class UserLgn extends EntityBase {
    @NonNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @NonNull
    @Column(name = "failed_count", nullable = false)
    private Long failedCount;

    public UserLgn(@NonNull User user, @NonNull Long failedCount, String createdBy, String modifiedBy) {
        super(createdBy, modifiedBy);
        this.user = user;
        this.failedCount = failedCount;
    }

    public UserLgn(@NonNull User user, @NonNull Long failedCount, String email) {
        super(email, email);
        this.user = user;
        this.failedCount = failedCount;
    }

    public void setCreatedBy(String email){
        super.setCreatedBy(email);
    }

    public void setModifiedBy(String email){
        super.setModifiedBy(email);
    }
}
