
package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.DashboardResponse;
import com.samadhan.inventory.dto.RecentStockMovementResponse;
import com.samadhan.inventory.entity.*;
import com.samadhan.inventory.repository.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final StockMovementRepository stockMovementRepository;

    @Value("${app.inventory.low-stock-threshold:5}")
    private Integer lowStockThreshold;

    public DashboardService(
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            SupplierRepository supplierRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            SalesOrderRepository salesOrderRepository,
            StockMovementRepository stockMovementRepository) {

        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Transactional
    public DashboardResponse getDashboard(User user) {

        Long tenantId = user.getTenant().getId();

        // Basic counts
        long totalProducts =
                productRepository.countByTenant_Id(tenantId);

        long totalCustomers =
                customerRepository.countByTenant_Id(tenantId);

        long totalSuppliers =
                supplierRepository.countByTenant_Id(tenantId);

        // Inventory valuation
        BigDecimal inventoryValue =
                productRepository.calculateInventoryValue(tenantId);

        // Stock alerts
        long lowStockProducts =
                productRepository.countByTenant_IdAndStockQuantityBetween(
                        tenantId, 1, lowStockThreshold
                );

        long outOfStockProducts =
                productRepository.countByTenant_IdAndStockQuantity(
                        tenantId, 0
                );

        // Order counts
        long totalSalesOrders =
                salesOrderRepository.countByTenant_Id(tenantId);

        long totalPurchaseOrders =
                purchaseOrderRepository.countByTenant_Id(tenantId);

        // Completed sales and purchase amounts
        BigDecimal totalSalesAmount =
                salesOrderRepository.calculateTotalByStatus(
                        tenantId, SalesOrderStatus.DISPATCHED
                );

        BigDecimal totalPurchaseAmount =
                purchaseOrderRepository.calculateTotalByStatus(
                        tenantId, PurchaseOrderStatus.RECEIVED
                );

        // Recent stock movements
        List<RecentStockMovementResponse> recentMovements =
                stockMovementRepository
                        .findTop10ByTenant_IdOrderByCreatedAtDesc(tenantId)
                        .stream()
                        .map(movement ->
                                new RecentStockMovementResponse(
                                        movement.getId(),
                                        movement.getProduct().getId(),
                                        movement.getProduct().getName(),
                                        movement.getProduct().getSku(),
                                        movement.getMovementType(),
                                        movement.getQuantity(),
                                        movement.getReason(),
                                        movement.getCreatedAt()
                                )
                        )
                        .toList();

        return new DashboardResponse(
                totalProducts,
                totalCustomers,
                totalSuppliers,
                inventoryValue,
                lowStockProducts,
                outOfStockProducts,
                totalSalesOrders,
                totalPurchaseOrders,
                totalSalesAmount,
                totalPurchaseAmount,
                recentMovements
        );
    }
}
