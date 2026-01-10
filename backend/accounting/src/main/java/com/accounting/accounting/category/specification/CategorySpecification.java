package com.accounting.accounting.category.specification;

import com.accounting.accounting.category.entity.Category;
import jakarta.persistence.criteria.Predicate;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
public class CategorySpecification {
    public static Specification<@NonNull Category> filterBy(
            Long typeId,
            String keyword,
            Boolean active
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("type").get("id"), typeId));

            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase() + "%";

                Predicate labelLike = cb.like(cb.lower(root.get("label")), like);
                Predicate descLike  = cb.like(cb.lower(root.get("description")), like);

                predicates.add(cb.or(labelLike, descLike));
            }

            if (active != null ) {
                predicates.add(cb.equal(root.get("isActive"), active));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

}
