package com.samadhan.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SalesOrderRequest(

        @NotNull(message = "Customer ID is required")
        Long customerId,

        @NotEmpty(message = "At least one product is required")
        List<@Valid SalesOrderItemRequest> items

) {}