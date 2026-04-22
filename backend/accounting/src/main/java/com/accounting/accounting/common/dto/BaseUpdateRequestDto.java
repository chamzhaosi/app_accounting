package com.accounting.accounting.common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Setter;

@Setter
public abstract class BaseUpdateRequestDto extends BaseDto {
  @Override
  @NotNull(message = "id is required")
  public Long getId() {
    return super.id;
  }

  @Override
  @NotNull(message = "vrs is required")
  public Long getVrs() {
    return super.vrs;
  }
}
