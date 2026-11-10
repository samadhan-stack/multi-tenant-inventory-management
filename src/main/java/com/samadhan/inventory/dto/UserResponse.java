package com.samadhan.inventory.dto;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        boolean active
) {}