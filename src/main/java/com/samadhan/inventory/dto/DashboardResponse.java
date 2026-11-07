
package com.samadhan.inventory.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        Long totalProducts,
        Long totalCustomers,
        Long totalSuppliers,
        BigDecimal inventoryValue,
        Long lowStockProducts,
        Long outOfStockProducts,
        Long totalSalesOrders,
        Long totalPurchaseOrders,
        BigDecimal totalSalesAmount,
        BigDecimal totalPurchaseAmount,
        List<RecentStockMovementResponse> recentStockMovements
) {}
