package com.samadhan.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PurchaseOrderRequest(

        @NotNull(message = "Supplier ID is required")
        Long supplierId,

        @NotEmpty(message = "Purchase order must contain at least one item")
        List<@Valid PurchaseOrderItemRequest> items

) {}