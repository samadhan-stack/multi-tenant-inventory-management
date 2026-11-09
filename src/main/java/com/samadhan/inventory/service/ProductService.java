package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.ProductRequest;
import com.samadhan.inventory.dto.ProductResponse;
import com.samadhan.inventory.entity.Category;
import com.samadhan.inventory.entity.Product;
import com.samadhan.inventory.entity.Tenant;
import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.repository.CategoryRepository;
import com.samadhan.inventory.repository.ProductRepository;
import com.samadhan.inventory.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final TenantRepository tenantRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            TenantRepository tenantRepository,
            CategoryRepository categoryRepository) {

        this.productRepository = productRepository;
        this.tenantRepository = tenantRepository;
        this.categoryRepository = categoryRepository;
    }

    private ProductResponse mapToResponse(Product product) {

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getCategory() != null
                        ? product.getCategory().getId() : null,
                product.getCategory() != null
                        ? product.getCategory().getName() : null
        );
    }

    private Category findCategory(Long categoryId, Long tenantId) {

        if (categoryId == null) {
            return null;
        }

        return categoryRepository
                .findByIdAndTenant_Id(categoryId, tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Category not found"
                        )
                );
    }

    @Transactional
    public ProductResponse createProduct(
            ProductRequest request, User user) {

        Long tenantId = user.getTenant().getId();

        if (productRepository.existsBySkuAndTenant_Id(
                request.sku(), tenantId)) {

            throw new IllegalArgumentException(
                    "Product SKU already exists"
            );
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Tenant not found")
                );

        Category category = findCategory(
                request.categoryId(), tenantId
        );

        Product product = new Product(
                request.name(),
                request.sku(),
                request.description(),
                request.price(),
                0,
                tenant
        );

        product.setCategory(category);

        return mapToResponse(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts(User user) {

        Long tenantId = user.getTenant().getId();

        return productRepository
                .findAllByTenant_Id(tenantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id, User user) {

        Product product = productRepository
                .findByIdAndTenant_Id(
                        id, user.getTenant().getId()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found")
                );

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(
            Long id, ProductRequest request, User user) {

        Long tenantId = user.getTenant().getId();

        Product product = productRepository
                .findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found")
                );

        if (productRepository.existsBySkuAndTenant_IdAndIdNot(
                request.sku(), tenantId, id)) {

            throw new IllegalArgumentException(
                    "Product SKU already exists"
            );
        }

        Category category = findCategory(
                request.categoryId(), tenantId
        );

        product.updateDetails(
                request.name(),
                request.sku(),
                request.description(),
                request.price()
        );

        product.setCategory(category);

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id, User user) {

        Product product = productRepository
                .findByIdAndTenant_Id(
                        id, user.getTenant().getId()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found")
                );

        productRepository.delete(product);
    }
}