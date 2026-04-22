package com.accounting.accounting.common.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public abstract class BaseDto {
  protected Long id;
  protected Long vrs;

  public BaseDto(Long id, Long vrs) {
    this.id = id;
    this.vrs = vrs;
  }
}
