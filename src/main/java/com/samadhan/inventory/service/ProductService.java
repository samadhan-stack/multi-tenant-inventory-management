package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.ProductRequest;
import com.samadhan.inventory.dto.ProductResponse;

import com.samadhan.inventory.entity.Product;
import com.samadhan.inventory.entity.Tenant;
import com.samadhan.inventory.entity.User;

import com.samadhan.inventory.repository.ProductRepository;
import com.samadhan.inventory.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final TenantRepository tenantRepository;

    public ProductService(
            ProductRepository productRepository,
            TenantRepository tenantRepository) {

        this.productRepository = productRepository;
        this.tenantRepository = tenantRepository;
    }

    private ProductResponse mapToResponse(Product product) {

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity()
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

        Product product = new Product(
                request.name(),
                request.sku(),
                request.description(),
                request.price(),
                0,
                tenant
        );

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

        product.updateDetails(
                request.name(),
                request.sku(),
                request.description(),
                request.price()
        );

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