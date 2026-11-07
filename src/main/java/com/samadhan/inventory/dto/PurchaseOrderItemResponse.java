package com.samadhan.inventory.dto;

import java.math.BigDecimal;

public record PurchaseOrderItemResponse(

        Long id,
        Long productId,
        String productName,
        String sku,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal

) {}