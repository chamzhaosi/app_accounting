package com.accounting.accounting.category.dto;

import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.common.dto.BaseResponseDto;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CategoryResponse extends BaseResponseDto {
    private String label;
    private String description;
    private TransactionTypeResponse txnType;
    @JsonProperty("isActive")
    private Boolean isActive;

    public CategoryResponse(Category category){
        super(category.getId(), category.getVrs());
        this.label = category.getLabel();
        this.description = category.getDescription();
        this.txnType = new TransactionTypeResponse(category.getType());
        this.isActive =  category.getIsActive();
    }
}
