package com.samadhan.inventory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(

        @NotBlank(message = "Customer name is required")
        @Size(max = 150, message = "Name cannot exceed 150 characters")
        String name,

        @Email(message = "Please provide a valid email address")
        @Size(max = 150, message = "Email cannot exceed 150 characters")
        String email,

        @Size(max = 20, message = "Phone cannot exceed 20 characters")
        String phone,

        @Size(max = 500, message = "Address cannot exceed 500 characters")
        String address

) {}