package com.samadhan.inventory.dto;

import com.samadhan.inventory.entity.PurchaseOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PurchaseOrderResponse(

        Long id,
        String orderNumber,
        Long supplierId,
        String supplierName,
        PurchaseOrderStatus status,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        List<PurchaseOrderItemResponse> items

) {}