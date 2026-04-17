package com.accounting.accounting.category.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor
public class CategoryDeleteRequest {

    @NotEmpty(message = "Ids are required")
    private List<@NotNull(message = "Id must not be null") Long> ids;
}
