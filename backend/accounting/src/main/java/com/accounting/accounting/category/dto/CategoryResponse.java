package com.accounting.accounting.category.dto;

import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.common.dto.BaseDto;
import com.accounting.accounting.transaction.dto.txntype.TransactionTypeResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CategoryResponse implements BaseDto {
    private Long id;
    private Long vrs;
    private String label;
    private String description;
    private TransactionTypeResponse txnType;
    @JsonProperty("isActive")
    private Boolean isActive;

    public CategoryResponse(Category category){
        this.id = category.getId();
        this.vrs = category.getVrs();
        this.label = category.getLabel();
        this.description = category.getDescription();
        this.txnType = new TransactionTypeResponse(category.getType());
        this.isActive =  category.getIsActive();
    }
}
