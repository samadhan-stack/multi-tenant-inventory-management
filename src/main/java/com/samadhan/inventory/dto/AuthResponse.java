package com.samadhan.inventory.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        String email,
        String role,
        Long tenantId
) {}