package com.accounting.accounting.common.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
public abstract class BaseResponseDto extends BaseDto{
  public BaseResponseDto(Long id, Long vrs){
    super(id, vrs);
  }
}
