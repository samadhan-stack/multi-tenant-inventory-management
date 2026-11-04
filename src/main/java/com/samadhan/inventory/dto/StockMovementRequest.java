package com.samadhan.inventory.dto;

import com.samadhan.inventory.entity.MovementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record StockMovementRequest(

        @NotNull
        MovementType movementType,

        @NotNull
        @Positive
        Integer quantity,

        @NotBlank
        String reason

) {}