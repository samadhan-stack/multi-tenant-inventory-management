package com.samadhan.inventory.dto;

import com.samadhan.inventory.entity.MovementType;

import java.time.LocalDateTime;

public record RecentStockMovementResponse(
        Long id,
        Long productId,
        String productName,
        String sku,
        MovementType movementType,
        Integer quantity,
        String reason,
        LocalDateTime createdAt
) {}
