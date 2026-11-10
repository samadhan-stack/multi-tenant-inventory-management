package com.samadhan.inventory.dto;

import com.samadhan.inventory.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(

        @NotNull
        Role role

) {}