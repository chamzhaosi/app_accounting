package com.accounting.accounting.category.service;

import com.accounting.accounting.category.dto.CategoryRequest;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.category.repository.CategoryRepository;
import com.accounting.accounting.category.specification.CategorySpecification;
import com.accounting.accounting.common.exception.BadRequestException;
import com.accounting.accounting.common.exception.ResourceNotFoundException;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.transactionType.entity.TransactionType;
import com.accounting.accounting.transactionType.repository.TransactionTypeRepository;
import jakarta.transaction.Transactional;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final TransactionTypeRepository transactionTypeRepository;

    private TransactionType getTxnTypeById(Long typeId) {
        return transactionTypeRepository.findById(typeId).orElseThrow(() -> new ResourceNotFoundException(("Invalid transaction type id")));
    }

    public CategoryService(CategoryRepository categoryRepository, TransactionTypeRepository transactionTypeRepository){
        this.categoryRepository = categoryRepository;
        this.transactionTypeRepository = transactionTypeRepository;
    }

    public Category create(CategoryRequest req){
        TransactionType type = getTxnTypeById(req.getTypeId());

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

    public Page<@NonNull Category> findAllByTypeId(Long typeId, int page, int size, String sort){

        TransactionType type = getTxnTypeById(typeId);

        return categoryRepository.findAllByType(type, Common.genPageable(page, size, sort));
    }

    public Page<@NonNull Category> findAllByTypeIdWithParams(Long typeId, String param, int page, int size, String sort){
        TransactionType type = getTxnTypeById(typeId);

        Specification<@NonNull Category> spec =
                CategorySpecification.filterBy(type.getId(), param);

        return categoryRepository.findAll(spec, Common.genPageable(page, size, sort));
    }

    public Page<@NonNull Category> findAllByTypeIdWithActive(Long typeId, int page, int size, String sort){
        TransactionType type = getTxnTypeById(typeId);

        return categoryRepository.findAllByTypeAndIsActiveTrue(type, Common.genPageable(page, size, sort));
    }

    @Transactional
    public Category updateById(Long id, CategoryRequest request){
        TransactionType type = getTxnTypeById(request.getTypeId());

        Category category = categoryRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Category not found")
        );

        category.setType(type);
        category.setLabel(request.getLabel());
        category.setDescription(request.getDescription());
        category.setActive(request.getIsActive());

        return category;
    }
}
