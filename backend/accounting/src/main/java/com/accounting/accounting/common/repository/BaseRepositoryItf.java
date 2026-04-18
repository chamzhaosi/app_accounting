package com.accounting.accounting.common.repository;

import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@NoRepositoryBean
public interface BaseRepositoryItf<R, ID> extends JpaRepository<@NonNull R, @NonNull ID> {
  @Query(
        """
        SELECT e
        FROM #{#entityName} e
        WHERE (e.user.id = :userId OR e.user IS NULL)
            AND e.id IN (:ids)
            AND e.deletedAt IS NULL
        """
  )
  List<R> findByIds(@Param("userId") Long userId,
                    @Param("ids") List<Long> ids);

  @Query(
        """
        SELECT e
        FROM #{#entityName} e
        WHERE (e.user.id = :userId OR e.user IS NULL)
            AND e.id = :id
            AND e.deletedAt IS NULL
        """
  )
  Optional<R> findById(@Param("userId") Long userId,
                       @Param("id") Long id);

}
