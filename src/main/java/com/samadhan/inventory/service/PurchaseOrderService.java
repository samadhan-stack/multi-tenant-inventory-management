package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.PurchaseOrderItemRequest;
import com.samadhan.inventory.dto.PurchaseOrderItemResponse;
import com.samadhan.inventory.dto.PurchaseOrderRequest;
import com.samadhan.inventory.dto.PurchaseOrderResponse;
import com.samadhan.inventory.entity.*;
import com.samadhan.inventory.exception.BusinessRuleException;
import com.samadhan.inventory.exception.ResourceNotFoundException;
import com.samadhan.inventory.repository.PurchaseOrderRepository;
import com.samadhan.inventory.repository.ProductRepository;
import com.samadhan.inventory.repository.SupplierRepository;
import com.samadhan.inventory.repository.StockMovementRepository;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementRepository stockMovementRepository;

    public PurchaseOrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            ProductRepository productRepository,
            SupplierRepository supplierRepository,
            StockMovementRepository stockMovementRepository
    ) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    // 1. Create Purchase Order
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(
            PurchaseOrderRequest request,
            User user
    ) {
        Long tenantId = user.getTenant().getId();

        // Prevent duplicate products in the same purchase order
        Set<Long> productIds = new HashSet<>();

        for (PurchaseOrderItemRequest itemRequest : request.items()) {
            if (!productIds.add(itemRequest.productId())) {
                throw new BusinessRuleException(
                        "Duplicate product found in purchase order: "
                                + itemRequest.productId()
                );
            }
        }

        Supplier supplier = supplierRepository
                .findByIdAndTenant_Id(request.supplierId(), tenantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Supplier not found"));

        String orderNumber = "PO-" +
                UUID.randomUUID().toString()
                        .substring(0, 8).toUpperCase();

        PurchaseOrder purchaseOrder = new PurchaseOrder(
                orderNumber,
                supplier,
                user.getTenant(),
                user
        );

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseOrderItemRequest itemRequest : request.items()) {

            Product product = productRepository
                    .findByIdAndTenant_Id(
                            itemRequest.productId(),
                            tenantId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Product not found: " + itemRequest.productId()
                            ));

            PurchaseOrderItem item = new PurchaseOrderItem(
                    product,
                    itemRequest.quantity(),
                    itemRequest.unitPrice()
            );

            purchaseOrder.addItem(item);

            totalAmount = totalAmount.add(item.getSubtotal());
        }

        purchaseOrder.setTotalAmount(totalAmount);

        PurchaseOrder savedOrder =
                purchaseOrderRepository.save(purchaseOrder);

        return mapToResponse(savedOrder);
    }

    // 2. Get All Purchase Orders
    public List<PurchaseOrderResponse> getAllPurchaseOrders(User user) {

        Long tenantId = user.getTenant().getId();

        return purchaseOrderRepository
                .findAllByTenant_IdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 3. Get Purchase Order By ID
    public PurchaseOrderResponse getPurchaseOrderById(
            Long orderId,
            User user
    ) {
        Long tenantId = user.getTenant().getId();

        PurchaseOrder purchaseOrder = purchaseOrderRepository
                .findByIdAndTenant_Id(orderId, tenantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Purchase order not found"));

        return mapToResponse(purchaseOrder);
    }

    // 4. Confirm Purchase Order
    @Transactional
    public PurchaseOrderResponse confirmPurchaseOrder(
            Long orderId,
            User user
    ) {
        Long tenantId = user.getTenant().getId();

        PurchaseOrder purchaseOrder = purchaseOrderRepository
                .findByIdAndTenant_Id(orderId, tenantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Purchase order not found"));

        if (purchaseOrder.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new BusinessRuleException(
                    "Only DRAFT orders can be confirmed"
            );
        }

        purchaseOrder.setStatus(PurchaseOrderStatus.CONFIRMED);

        return mapToResponse(purchaseOrderRepository.save(purchaseOrder));
    }

    // 5. Receive Purchase Order
    @Transactional
    public PurchaseOrderResponse receivePurchaseOrder(
            Long orderId,
            User user
    ) {
        Long tenantId = user.getTenant().getId();

        PurchaseOrder purchaseOrder = purchaseOrderRepository
                .findByIdAndTenant_Id(orderId, tenantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Purchase order not found"));

        if (purchaseOrder.getStatus() != PurchaseOrderStatus.CONFIRMED) {
            throw new BusinessRuleException(
                    "Only CONFIRMED orders can be received"
            );
        }

        // Change status first and force the optimistic locking check
        purchaseOrder.setStatus(PurchaseOrderStatus.RECEIVED);
        purchaseOrderRepository.saveAndFlush(purchaseOrder);

        for (PurchaseOrderItem item : purchaseOrder.getItems()) {

            Product product = item.getProduct();

            product.changeStock(item.getQuantity());
            productRepository.saveAndFlush(product);

            StockMovement movement = new StockMovement(
                    product,
                    user.getTenant(),
                    MovementType.STOCK_IN,
                    item.getQuantity(),
                    "Purchase Order received: "
                            + purchaseOrder.getOrderNumber(),
                    user
            );

            stockMovementRepository.save(movement);
        }

        return mapToResponse(purchaseOrder);
    }

    // 6. Cancel Purchase Order
    @Transactional
    public PurchaseOrderResponse cancelPurchaseOrder(
            Long orderId,
            User user
    ) {
        Long tenantId = user.getTenant().getId();

        PurchaseOrder purchaseOrder = purchaseOrderRepository
                .findByIdAndTenant_Id(orderId, tenantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Purchase order not found"));

        if (purchaseOrder.getStatus() == PurchaseOrderStatus.RECEIVED ||
                purchaseOrder.getStatus() == PurchaseOrderStatus.CANCELLED) {

            throw new BusinessRuleException(
                    "This purchase order cannot be cancelled"
            );
        }

        purchaseOrder.setStatus(PurchaseOrderStatus.CANCELLED);

        return mapToResponse(purchaseOrderRepository.save(purchaseOrder));
    }

    // 7. Convert Entity to Response DTO
    private PurchaseOrderResponse mapToResponse(
            PurchaseOrder purchaseOrder
    ) {
        List<PurchaseOrderItemResponse> itemResponses =
                purchaseOrder.getItems()
                        .stream()
                        .map(item -> new PurchaseOrderItemResponse(
                                item.getId(),
                                item.getProduct().getId(),
                                item.getProduct().getName(),
                                item.getProduct().getSku(),
                                item.getQuantity(),
                                item.getUnitPrice(),
                                item.getSubtotal()
                        ))
                        .toList();

        return new PurchaseOrderResponse(
                purchaseOrder.getId(),
                purchaseOrder.getOrderNumber(),
                purchaseOrder.getSupplier().getId(),
                purchaseOrder.getSupplier().getName(),
                purchaseOrder.getStatus(),
                purchaseOrder.getTotalAmount(),
                purchaseOrder.getCreatedAt(),
                itemResponses
        );
    }
}