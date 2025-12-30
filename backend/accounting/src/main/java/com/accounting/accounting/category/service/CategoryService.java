package com.accounting.accounting.category.service;

import com.accounting.accounting.category.dto.CategoryRequest;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.category.repository.CategoryRepository;
import com.accounting.accounting.common.exception.BadRequestException;
import com.accounting.accounting.common.exception.ResourceNotFoundException;
import com.accounting.accounting.transactionType.entity.TransactionType;
import com.accounting.accounting.transactionType.repository.TransactionTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final TransactionTypeRepository transactionTypeRepository;

    public CategoryService(CategoryRepository categoryRepository, TransactionTypeRepository transactionTypeRepository){
        this.categoryRepository = categoryRepository;
        this.transactionTypeRepository = transactionTypeRepository;
    }

    public Category create(CategoryRequest req){
        TransactionType type =transactionTypeRepository.findById(req.getTypeId()).orElseThrow(() -> new ResourceNotFoundException(("Invalid transaction type id")));

        boolean exists = categoryRepository
                .existsByLabelIgnoreCaseAndType_Id(req.getLabel().trim(), req.getTypeId());

        if (exists) {
            throw new BadRequestException("Category label already exists under this transaction type");
        }


        Category ctr = new Category();
        ctr.setLabel(req.getLabel());
        ctr.setDescription(req.getDescription());
        ctr.setType(type);

        return categoryRepository.save(ctr);
    }

    public List<Category> findAllByTypeId(Long typeId){

        TransactionType type = transactionTypeRepository.findById(typeId).orElseThrow(() -> new ResourceNotFoundException(("Invalid transaction type id")));

        return categoryRepository.findAllByType(type);
    }





}
