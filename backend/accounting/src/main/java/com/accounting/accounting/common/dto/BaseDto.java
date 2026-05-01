package com.accounting.accounting.common.dto;

import jakarta.validation.constraints.NotNull;

public interface BaseDto {
  @NotNull(message = "id is required")
  Long getId();

  @NotNull(message = "vrs is required")
  Long getVrs();
}
