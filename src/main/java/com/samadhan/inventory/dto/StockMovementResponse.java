package com.samadhan.inventory.dto;

import com.samadhan.inventory.entity.MovementType;
import java.time.LocalDateTime;

public record StockMovementResponse(
        Long id,
        Long productId,
        String productName,
        MovementType movementType,
        Integer quantity,
        String reason,
        LocalDateTime createdAt
) {}