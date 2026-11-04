package com.samadhan.inventory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SupplierRequest(

        @NotBlank(message = "Supplier name is required")
        @Size(max = 150)
        String name,

        @Email(message = "Enter a valid email")
        String email,

        String phone,

        String address

) {}