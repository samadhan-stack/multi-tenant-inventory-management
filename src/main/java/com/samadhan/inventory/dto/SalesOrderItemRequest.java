package com.samadhan.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SalesOrderItemRequest(

        @NotNull(message = "Product ID is required")
        Long productId,

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be greater than zero")
        Integer quantity

) {}