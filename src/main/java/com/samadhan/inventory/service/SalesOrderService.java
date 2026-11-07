
package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.SalesOrderItemRequest;
import com.samadhan.inventory.dto.SalesOrderItemResponse;
import com.samadhan.inventory.dto.SalesOrderRequest;
import com.samadhan.inventory.dto.SalesOrderResponse;
import com.samadhan.inventory.entity.*;
import com.samadhan.inventory.exception.BusinessRuleException;
import com.samadhan.inventory.exception.ResourceNotFoundException;
import com.samadhan.inventory.repository.CustomerRepository;
import com.samadhan.inventory.repository.ProductRepository;
import com.samadhan.inventory.repository.SalesOrderRepository;
import com.samadhan.inventory.repository.StockMovementRepository;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final StockMovementRepository stockMovementRepository;

    public SalesOrderService(
            SalesOrderRepository salesOrderRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            StockMovementRepository stockMovementRepository) {

        this.salesOrderRepository = salesOrderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    // 1. Create Sales Order
    @Transactional
    public SalesOrderResponse createSalesOrder(
            SalesOrderRequest request,
            User user) {

        Long tenantId = user.getTenant().getId();

        // Prevent duplicate products in one order
        Set<Long> productIds = new HashSet<>();

        for (SalesOrderItemRequest itemRequest : request.items()) {

            if (!productIds.add(itemRequest.productId())) {
                throw new BusinessRuleException(
                        "Duplicate product found in sales order: "
                                + itemRequest.productId()
                );
            }
        }

        // Find customer belonging to current tenant
        Customer customer = customerRepository
                .findByIdAndTenant_Id(request.customerId(), tenantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));

        // Generate unique order number
        String orderNumber = "SO-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();

        SalesOrder salesOrder = new SalesOrder(
                orderNumber,
                customer,
                user.getTenant(),
                user
        );

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Add order items
        for (SalesOrderItemRequest itemRequest : request.items()) {

            Product product = productRepository
                    .findByIdAndTenant_Id(
                            itemRequest.productId(),
                            tenantId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Product not found: "
                                            + itemRequest.productId()
                            ));

            // Capture current product selling price
            BigDecimal unitPrice = product.getPrice();

            SalesOrderItem item = new SalesOrderItem(
                    product,
                    itemRequest.quantity(),
                    unitPrice
            );

            salesOrder.addItem(item);

            totalAmount = totalAmount.add(item.getSubtotal());
        }

        salesOrder.setTotalAmount(totalAmount);

        SalesOrder savedOrder =
                salesOrderRepository.save(salesOrder);

        return mapToResponse(savedOrder);
    }

    // 2. Get All Sales Orders
    public List<SalesOrderResponse> getAllSalesOrders(User user) {

        Long tenantId = user.getTenant().getId();

        return salesOrderRepository
                .findAllByTenant_IdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 3. Get Sales Order By ID
    public SalesOrderResponse getSalesOrderById(
            Long orderId,
            User user) {

        Long tenantId = user.getTenant().getId();

        SalesOrder salesOrder = salesOrderRepository
                .findByIdAndTenant_Id(orderId, tenantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sales order not found"
                        ));

        return mapToResponse(salesOrder);
    }

    // 4. Confirm Sales Order
    @Transactional
    public SalesOrderResponse confirmSalesOrder(
            Long orderId,
            User user) {

        SalesOrder salesOrder = getSalesOrder(orderId, user);

        if (salesOrder.getStatus() != SalesOrderStatus.DRAFT) {
            throw new BusinessRuleException(
                    "Only DRAFT sales orders can be confirmed"
            );
        }

        salesOrder.setStatus(SalesOrderStatus.CONFIRMED);

        SalesOrder savedOrder =
                salesOrderRepository.save(salesOrder);

        return mapToResponse(savedOrder);
    }

    // 5. Dispatch Sales Order
    @Transactional
    public SalesOrderResponse dispatchSalesOrder(
            Long orderId,
            User user) {

        SalesOrder salesOrder = getSalesOrder(orderId, user);

        if (salesOrder.getStatus() != SalesOrderStatus.CONFIRMED) {
            throw new BusinessRuleException(
                    "Only CONFIRMED sales orders can be dispatched"
            );
        }

        // Change status and force optimistic locking check
        salesOrder.setStatus(SalesOrderStatus.DISPATCHED);
        salesOrderRepository.saveAndFlush(salesOrder);

        // Deduct stock and create stock-out movements
        for (SalesOrderItem item : salesOrder.getItems()) {

            Product product = item.getProduct();

            // Deduct ordered quantity from stock
            product.changeStock(-item.getQuantity());

            productRepository.saveAndFlush(product);

            // Record stock movement
            StockMovement movement = new StockMovement(
                    product,
                    user.getTenant(),
                    MovementType.STOCK_OUT,
                    item.getQuantity(),
                    "Sales Order dispatched: "
                            + salesOrder.getOrderNumber(),
                    user
            );

            stockMovementRepository.save(movement);
        }

        return mapToResponse(salesOrder);
    }

    // 6. Cancel Sales Order
    @Transactional
    public SalesOrderResponse cancelSalesOrder(
            Long orderId,
            User user) {

        SalesOrder salesOrder = getSalesOrder(orderId, user);

        if (salesOrder.getStatus() == SalesOrderStatus.DISPATCHED) {
            throw new BusinessRuleException(
                    "Dispatched sales orders cannot be cancelled"
            );
        }

        if (salesOrder.getStatus() == SalesOrderStatus.CANCELLED) {
            throw new BusinessRuleException(
                    "Sales order is already cancelled"
            );
        }

        salesOrder.setStatus(SalesOrderStatus.CANCELLED);

        SalesOrder savedOrder =
                salesOrderRepository.save(salesOrder);

        return mapToResponse(savedOrder);
    }

    // 7. Find Sales Order for Current Tenant
    private SalesOrder getSalesOrder(Long orderId, User user) {

        Long tenantId = user.getTenant().getId();

        return salesOrderRepository
                .findByIdAndTenant_Id(orderId, tenantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sales order not found"
                        ));
    }

    // 8. Convert Entity to Response DTO
    private SalesOrderResponse mapToResponse(
            SalesOrder salesOrder) {

        List<SalesOrderItemResponse> itemResponses =
                salesOrder.getItems()
                        .stream()
                        .map(item -> new SalesOrderItemResponse(
                                item.getId(),
                                item.getProduct().getId(),
                                item.getProduct().getName(),
                                item.getProduct().getSku(),
                                item.getQuantity(),
                                item.getUnitPrice(),
                                item.getSubtotal()
                        ))
                        .toList();

        return new SalesOrderResponse(
                salesOrder.getId(),
                salesOrder.getOrderNumber(),
                salesOrder.getCustomer().getId(),
                salesOrder.getCustomer().getName(),
                salesOrder.getStatus(),
                salesOrder.getTotalAmount(),
                salesOrder.getCreatedAt(),
                itemResponses
        );
    }
}
