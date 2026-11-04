package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.StockMovementRequest;
import com.samadhan.inventory.dto.StockMovementResponse;

import com.samadhan.inventory.entity.*;

import com.samadhan.inventory.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockService {

    private final ProductRepository productRepository;
    private final TenantRepository tenantRepository;
    private final StockMovementRepository stockMovementRepository;

    public StockService(
            ProductRepository productRepository,
            TenantRepository tenantRepository,
            StockMovementRepository stockMovementRepository) {

        this.productRepository = productRepository;
        this.tenantRepository = tenantRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Transactional
    public StockMovementResponse recordMovement(
            Long productId,
            StockMovementRequest request,
            User user) {

        Long tenantId = user.getTenant().getId();

        Product product = productRepository
                .findByIdAndTenant_Id(productId, tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found")
                );

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Tenant not found")
                );

        int stockChange;

        if (request.movementType() == MovementType.STOCK_IN) {

            stockChange = request.quantity();

        } else {

            stockChange = -request.quantity();
        }

        product.changeStock(stockChange);

        // Force database update now.
        // This also checks the optimistic lock version.
        productRepository.saveAndFlush(product);

        StockMovement movement = new StockMovement(
                product,
                tenant,
                request.movementType(),
                request.quantity(),
                request.reason(),
                user
        );

        StockMovement savedMovement =
                stockMovementRepository.save(movement);

        return mapToResponse(savedMovement);
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponse> getAllMovements(User user) {

        Long tenantId = user.getTenant().getId();

        return stockMovementRepository
                .findAllByTenant_IdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponse> getProductMovements(
            Long productId, User user) {

        Long tenantId = user.getTenant().getId();

        // Verify product belongs to current tenant.
        productRepository.findByIdAndTenant_Id(productId, tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found")
                );

        return stockMovementRepository
                .findAllByProduct_IdAndTenant_IdOrderByCreatedAtDesc(
                        productId, tenantId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private StockMovementResponse mapToResponse(
            StockMovement movement) {

        return new StockMovementResponse(
                movement.getId(),
                movement.getProduct().getId(),
                movement.getProduct().getName(),
                movement.getMovementType(),
                movement.getQuantity(),
                movement.getReason(),
                movement.getCreatedAt()
        );
    }
}