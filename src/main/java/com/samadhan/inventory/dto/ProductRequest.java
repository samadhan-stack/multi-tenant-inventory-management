package com.samadhan.inventory.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(

        @NotBlank
        String name,

        @NotBlank
        String sku,

        String description,

        @NotNull
        @DecimalMin("0.01")
        BigDecimal price,

        Long categoryId

) {}