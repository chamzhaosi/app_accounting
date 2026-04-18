package com.accounting.accounting.category.service;

import com.accounting.accounting.category.dto.*;
import com.accounting.accounting.category.entity.Category;
import com.accounting.accounting.category.mapper.CategoryMapper;
import com.accounting.accounting.category.repository.CategoryRepository;
import com.accounting.accounting.category.service.itf.CategoryServiceItfItf;
import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.common.helper.Common;
import com.accounting.accounting.transaction.entity.txntype.TransactionType;
import com.accounting.accounting.transaction.repository.txntype.TransactionTypeRepository;
import com.accounting.accounting.transaction.service.txntype.TransactionTypeService;
import com.accounting.accounting.user.entity.User;
import lombok.NonNull;
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
public class CategoryService implements CategoryServiceItfItf {
    private final CategoryRepository categoryRepository;
    private final TransactionTypeService transactionTypeService;
    private final CategoryMapper categoryMapper;

    @Override
    public Page<@NonNull CategoryResponse> findAll(CategorySearchRequest request, Pageable pageable) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Category][Find All]  - User ({}) fetch all categories with params ({})", user.getEmail(), request.toString());
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

        boolean exist = categoryRepository.countBySameData(user.getId(), request.getTxnTypeId(), request.getLabel()) > 0;
        if(exist){
            throw new InvalidArgumentException(ExceptionEnum.DUPLICATE_DATA_FOUND);
        }

        TransactionType transactionType = transactionTypeService.getTransactionTypeByIds(user.getId(), request.getTxnTypeId());
        Category category = new Category(user, transactionType, request.getLabel(), request.getDescription());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(CategoryUpdateRequest request) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info("[Category][Update] - User ({}) update category by ids ({})", user.getEmail(), request.getId());

        Category category = categoryRepository.findById(user.getId(), request.getId())
                .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND));

        boolean exist = categoryRepository.countBySameData(user.getId(), request.getTxnTypeId(), request.getLabel()) > 0;
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
    public void deleteByIds(CategoryDeleteRequest request) {
        User user = Common.getAuthenticateUserNThrowException(null);
        log.info(
                "[Category][Delete] - User ({}) delete category: [{}]",
                user.getEmail(),
                request.getIds().stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(", "))
        );

        List<Category> categories = categoryRepository.findByIds(user.getId(), request.getIds());
        if(categories.isEmpty()){
            throw new InvalidArgumentException(ExceptionEnum.DATA_NOT_FOUND);
        }

        categories.forEach(c -> {
            c.setDeletedAt(LocalDateTime.now());
            c.setDeletedBy(user.getEmail());
        });
        categoryRepository.saveAll(categories);
    }

    public Category getCategoryById (Long userID, Long ctgrId){
      return categoryRepository.findById(userID, ctgrId)
              .orElseThrow(() -> new InvalidArgumentException(ExceptionEnum.CTGR_ID_NOT_FOUND_OR_INVALID));
    }
}
