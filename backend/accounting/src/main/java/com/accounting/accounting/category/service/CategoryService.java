package com.accounting.accounting.category.service;

import com.accounting.accounting.category.dto.CategoryCreateRequest;
import com.accounting.accounting.category.dto.CategoryResponse;
import com.accounting.accounting.category.dto.CategorySearchRequest;
import com.accounting.accounting.category.dto.CategoryUpdateRequest;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.category.mapper.CategoryMapper;
import com.accounting.accounting.category.repository.CategoryRepository;
import com.accounting.accounting.category.service.itf.CategoryServiceItf;
import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.accounting.accounting.transaction.repository.txntype.TransactionTypeRepository;
import com.accounting.accounting.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService implements CategoryServiceItf {
    private final CategoryRepository categoryRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public Page<CategoryResponse> findAll(CategorySearchRequest request, Pageable pageable) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Category][Find All]  - User ({}) all fetch of categories with params ({})", user.getEmail(), request.toString());
        return categoryRepository.findAll(user.getId(),
                        request.getLabel(),
                        request.getTxnTypeId(),
                        request.getIsActive(),
                        pageable)
                .map(categoryMapper::toResponse);
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryCreateRequest request) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Category][Create] - User ({}) create new category", user.getEmail());

        boolean exist = categoryRepository.countByUserIdAndLabel(user.getId(), request.getLabel()) > 0;
        if(exist){
            throw new InvalidArgumentException(ExceptionEnum.DUPLICATE_DATA_FOUND);
        }

        TransactionType transactionType = transactionTypeRepository
                .findById(user.getId(), request.getTxnTypeId())
                .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.TXN_TYPE_ID_NOT_FOUND_OR_INVALID));

        Category category = new Category(user, transactionType, request.getLabel(), request.getDescription());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(CategoryUpdateRequest request) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Category][Update] - User ({}) update category", user.getEmail());

        Category category = categoryRepository.findById(user.getId(), request.getId())
                .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));

        boolean exist = categoryRepository.countByUserIdAndLabel(user.getId(), request.getLabel()) > 0;
        if(exist){
            throw new InvalidArgumentException(ExceptionEnum.DUPLICATE_DATA_FOUND);
        }

        category.setLabel(request.getLabel());
        category.setDescription(request.getDescription());
        category.setIsActive(request.isActive());
        categoryRepository.save(category);

        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public void deleteByIds(List<Long> ids) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info(
                "[Category][Delete] - User ({}) delete category: [{}]",
                user.getEmail(),
                ids.stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(", "))
        );

        List<Category> categories = categoryRepository.findByIds(user.getId(), ids);
        if(categories.isEmpty()){
            throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND);
        }

        categories.forEach(c -> {
            c.setDeletedAt(LocalDateTime.now());
            c.setDeletedBy(user.getEmail());
        });
        categoryRepository.saveAll(categories);
    }
}
