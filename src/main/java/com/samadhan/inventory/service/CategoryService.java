package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.CategoryRequest;
import com.samadhan.inventory.dto.CategoryResponse;
import com.samadhan.inventory.entity.Category;
import com.samadhan.inventory.entity.Tenant;
import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.repository.CategoryRepository;
import com.samadhan.inventory.repository.TenantRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import com.samadhan.inventory.repository.ProductRepository;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;
    private final ProductRepository productRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            TenantRepository tenantRepository,
            ProductRepository productRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.tenantRepository = tenantRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, User user) {

        Long tenantId = user.getTenant().getId();

        if (categoryRepository.existsByNameAndTenant_Id(
                request.name(), tenantId)) {
            throw new IllegalArgumentException("Category already exists");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Category category = new Category(request.name(), tenant);

        Category savedCategory = categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    public List<CategoryResponse> getAllCategories(User user) {

        Long tenantId = user.getTenant().getId();

        return categoryRepository.findAllByTenant_Id(tenantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse updateCategory(
            Long categoryId,
            CategoryRequest request,
            User user
    ) {

        Long tenantId = user.getTenant().getId();

        Category category = categoryRepository
                .findByIdAndTenant_Id(categoryId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (categoryRepository.existsByNameAndTenant_IdAndIdNot(
                request.name(), tenantId, categoryId)) {
            throw new IllegalArgumentException("Category name already exists");
        }

        category.setName(request.name());

        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long categoryId, User user) {

        Long tenantId = user.getTenant().getId();

        Category category = categoryRepository
                .findByIdAndTenant_Id(categoryId, tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Category not found")
                );

        if (productRepository.existsByCategory_IdAndTenant_Id(
                categoryId, tenantId)) {

            throw new IllegalArgumentException(
                    "Cannot delete this category because products are assigned to it. "
                            + "Please reassign those products first."
            );
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {

        return new CategoryResponse(
                category.getId(),
                category.getName()
        );
    }
}